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
import {fetchIdentity, fetchLegacyIdentity} from 'src/identity/apis/auth'

// Components
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import LoginPageContents from 'src/onboarding/containers/LoginPageContents'
import {CLOUD} from 'src/shared/constants'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {getUiproxyQuartzLoginUrl} from 'src/client/uiproxydRoutes'

const EMPTY_HISTORY_STACK_LENGTH = 2

export const LoginPage: FC = () => {
  const [hasValidSession, setHasValidSession] = useState(false)

  const getSessionValidity = useCallback(async () => {
    try {
      if (isFlagEnabled('quartzSession')) {
        await fetchIdentity()
      } else {
        await fetchLegacyIdentity()
      }

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
  } else {
    if (isFlagEnabled('universalLogin')) {
      if (CLOUD) {
        let url
        getUiproxyQuartzLoginUrl({}).then(response => {
          url = response.data
        })

        console.warn('Redirect to cloud url: ', url)
        window.location.replace(url)
        return
      }
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
