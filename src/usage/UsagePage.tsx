// Libraries
import React, {FC} from 'react'
import {Page} from '@influxdata/clockface'

// Components
import UsageToday from 'src/usage/UsageToday'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'
import LimitChecker from 'src/cloud/components/LimitChecker'
import UsageProvider from 'src/usage/context/usage'

const Usage: FC = () => (
  <UsageProvider>
    <Page titleTag="Usage">
      <Page.Header fullWidth={false} testID="usage-page--header">
        <Page.Title title="Usage" />
        <LimitChecker>
          <RateLimitAlert />
        </LimitChecker>
      </Page.Header>
      <Page.Contents scrollable={true}>
        <UsageToday />
      </Page.Contents>
    </Page>
  </UsageProvider>
)

export default Usage
