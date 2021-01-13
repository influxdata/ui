// Libraries
import React, {FC} from 'react'
import {Page, RemoteDataState} from '@influxdata/clockface'

// Components
import PageSpinner from 'src/perf/components/PageSpinner'
import UsageToday from 'src/usage/UsageToday'
// import AlertStatusCancelled from 'src/usage/components/AlertStatusCancelled'
// import RateLimitAlert from 'js/components/Notifications/RateLimitAlert'

const Usage: FC = () => (
  <Page titleTag="Usage">
    <Page.Header fullWidth={false} testID="billing-page--header">
      <Page.Title title="Usage" />
      {/* <PageSpinner
              loading={limitLoading}
            >
              {!isCancelled && <RateLimitAlert />}
            </PageSpinner> */}
    </Page.Header>
    <Page.Contents scrollable={true}>
      {/* {isCancelled && <AlertStatusCancelled />} */}
      <PageSpinner loading={RemoteDataState.NotStarted}>
        <div />
        {/* <UsageToday
          // history={history}
          // selectedRange={selectedRange}
          // billingStart={billingStart}
          // pricingVersion={pricingVersion}
          /> */}
      </PageSpinner>
    </Page.Contents>
  </Page>
)

export default Usage
