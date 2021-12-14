// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {
  AppWrapper,
  FontWeight,
  FunnelPage,
  Heading,
  HeadingElement,
  InfluxDBCloudLogo,
  Typeface,
} from '@influxdata/clockface'
import {useHistory} from 'react-router-dom'
import Notifications from 'src/shared/components/notifications/Notifications'

// Types
import {getMe} from 'src/client'

// Components
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import LoginPageContents from 'src/onboarding/containers/LoginPageContents'

const EMPTY_HISTORY_STACK_LENGTH = 2

export const LoginPage: FC = () => {
  const [hasValidSession, setHasValidSession] = useState(false)

  const getSessionValidity = useCallback(async () => {
    try {
      const resp = await getMe({})

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
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
  }

  return (
    <ErrorBoundary>
      <AppWrapper>
        <Notifications />
        <FunnelPage
          enableGraphic={true}
          logo={<InfluxDBCloudLogo cloud={true} className="login-page--logo" />}
        >
          <Heading
            element={HeadingElement.H1}
            type={Typeface.Rubik}
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
