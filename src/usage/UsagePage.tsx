// Libraries
import React, {FC} from 'react'
import {Page} from '@influxdata/clockface'

// Components
import {UsageToday} from 'src/usage/UsageToday'
import OrgHeader from 'src/organizations/components/OrgHeader'
import OrgTabbedPage from 'src/organizations/components/OrgTabbedPage'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

const Usage: FC = () => {
  return (
    <Page titleTag={pageTitleSuffixer(['Usage', 'Organization'])}>
      <OrgHeader testID="usage-page--header" />
      <OrgTabbedPage activeTab="usage">
        <UsageToday />
      </OrgTabbedPage>
    </Page>
  )
}

export default Usage
