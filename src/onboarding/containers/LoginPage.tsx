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
import {client} from 'src/utils/api'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Components
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import LoginPageContents from 'src/onboarding/containers/LoginPageContents'

export const LoginPage: FC = () => {
  const [hasValidSession, setHasValidSession] = useState(false)

  const getSessionValidity = useCallback(async () => {
    try {
      await client.users.me()
      setHasValidSession(true)
    } catch {
      setHasValidSession(false)
    }
  }, [])

  useEffect(() => {
    getSessionValidity()
  }, [getSessionValidity])

  const history = useHistory()

  if (hasValidSession && isFlagEnabled('loginRedirectBack')) {
    history.goBack()
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
