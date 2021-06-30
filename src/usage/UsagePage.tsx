// Libraries
import React, {FC} from 'react'
import {Page} from '@influxdata/clockface'

// Components
import UsageToday from 'src/usage/UsageToday'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'
import LimitChecker from 'src/cloud/components/LimitChecker'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

const Usage: FC = () => {
  console.log('USAGE')
  return (
    <Page titleTag={pageTitleSuffixer(['Usage'])}>
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
  )
}

export default Usage
