// Libraries
import React, {FC} from 'react'
import {Page} from '@influxdata/clockface'

// Components
import UsageToday from 'src/usage/UsageToday'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'
import LimitChecker from 'src/cloud/components/LimitChecker'
import OrgHeader from 'src/organizations/components/OrgHeader'
import OrgTabbedPage from 'src/organizations/components/OrgTabbedPage'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

const Usage: FC = () => {
  if (isFlagEnabled('multiAccount')) {
    return (
      <Page titleTag={pageTitleSuffixer(['Usage', 'Organization'])}>
        <OrgHeader testID="usage-page--header" />
        <OrgTabbedPage activeTab="usage">
          <UsageToday />
        </OrgTabbedPage>
      </Page>
    )
  }

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
