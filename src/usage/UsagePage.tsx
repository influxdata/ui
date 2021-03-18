// Libraries
import React, {FC} from 'react'
import {Page} from '@influxdata/clockface'

// Components
import UsageToday from 'src/usage/UsageToday'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'
// import AlertStatusCancelled from 'src/billing/components/Usage/AlertStatusCancelled'
import LimitChecker from 'src/cloud/components/LimitChecker'
import CheckoutProvider from 'src/usage/context/usage'

// Reducers
const Usage: FC = () => (
  <CheckoutProvider>
    <Page titleTag="Usage">
      <Page.Header fullWidth={false} testID="usage-page--header">
        <Page.Title title="Usage" />
        <LimitChecker>
          <RateLimitAlert />
        </LimitChecker>
      </Page.Header>
      <Page.Contents scrollable={true}>
        {/* TODO(ariel):  find out if we want this */}
        {/* {isCancelled && <AlertStatusCancelled />} */}
        <UsageToday />
      </Page.Contents>
    </Page>
  </CheckoutProvider>
)

export default Usage
