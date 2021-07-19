import React, {FC} from 'react'

// Components
import OrgTabbedPage from 'src/organizations/components/OrgTabbedPage'
import OrgHeader from 'src/organizations/components/OrgHeader'
import {Page} from '@influxdata/clockface'
import GetResources from 'src/resources/components/GetResources'
import Members from 'src/members/components/Members'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Types
import {ResourceType} from 'src/types'

const MembersIndex: FC = ({children}) => (
  <>
    <Page titleTag={pageTitleSuffixer(['Members', 'Organization'])}>
      <OrgHeader />
      <OrgTabbedPage activeTab="members">
        <GetResources resources={[ResourceType.Members]}>
          <Members />
        </GetResources>
      </OrgTabbedPage>
    </Page>
    {children}
  </>
)

export default MembersIndex
