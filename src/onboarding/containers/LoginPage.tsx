// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {
  AppWrapper,
  FontWeight,
  FunnelPage,
  Heading,
  HeadingElement,
} from '@influxdata/clockface'
import {useHistory} from 'react-router-dom'
import Notifications from 'src/shared/components/notifications/Notifications'
import {CloudLogoWithCubo} from 'src/onboarding/components/CloudLogoWithCubo'

// APIs
import {fetchLegacyIdentity} from 'src/identity/apis/auth'

// Components
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import LoginPageContents from 'src/onboarding/containers/LoginPageContents'
import {CLOUD, CLOUD_LOGIN_PATHNAME} from 'src/shared/constants'

const EMPTY_HISTORY_STACK_LENGTH = 2

export const LoginPage: FC = () => {
  console.log('LoginPage')
  const [hasValidSession, setHasValidSession] = useState(false)

  const getSessionValidity = useCallback(async () => {
    try {
      await fetchLegacyIdentity()
      setHasValidSession(true)
    } catch {
      setHasValidSession(false)
    }
  }, [])

  useEffect(() => {
    getSessionValidity()
  }, [getSessionValidity])

  const history = useHistory()

  if (hasValidSession) {
    if (history.length <= EMPTY_HISTORY_STACK_LENGTH) {
      // If the user directly navigates to the login page after having a session but no stack
      history.push('/')
    } else {
      history.goBack()
    }
    return null
  }
  else {
    if (CLOUD) {
      const url = new URL(
        `${window.location.origin}${CLOUD_LOGIN_PATHNAME}`
      ).href

      window.location.href = url
      return
    }
  }


  return (
    <ErrorBoundary>
      <AppWrapper>
        <Notifications />
        <FunnelPage enableGraphic={true} logo={<CloudLogoWithCubo />}>
          <Heading
            element={HeadingElement.H1}
            weight={FontWeight.Regular}
            className="cf-funnel-page--title"
          >
            Log in to your InfluxDB Account
          </Heading>
          <LoginPageContents />
        </FunnelPage>
      </AppWrapper>
    </ErrorBoundary>
  )
}
