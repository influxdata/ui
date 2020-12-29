// Libraries
import React, {FC} from 'react'
import {
  AppWrapper,
  FontWeight,
  FunnelPage,
  Heading,
  HeadingElement,
  InfluxDBCloudLogo,
  Typeface,
} from '@influxdata/clockface'
import Notifications from 'src/shared/components/notifications/Notifications'

// Components
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import LoginPageContents from 'src/onboarding/containers/LoginPageContents'

export const LoginPage: FC = () => (
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
          Log in to your InfluxDB Cloud Account
        </Heading>
        <LoginPageContents />
      </FunnelPage>
    </AppWrapper>
  </ErrorBoundary>
)
