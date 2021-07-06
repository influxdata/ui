// Libraries
import React, {FC} from 'react'
import {Switch, Route} from 'react-router-dom'

// Components
import OrgTabbedPage from 'src/organizations/components/OrgTabbedPage'
import OrgHeader from 'src/organizations/components/OrgHeader'
import {Page} from '@influxdata/clockface'
import OrgProfileTab from 'src/organizations/components/OrgProfileTab'
import RenameOrgOverlay from 'src/organizations/components/RenameOrgOverlay'
import DeleteOrgOverlay from 'src/organizations/components/DeleteOrgOverlay'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

const OrgProfilePage: FC = () => (
  <>
    <Page titleTag={pageTitleSuffixer(['About', 'Organization'])}>
      <OrgHeader />
      <OrgTabbedPage activeTab="about">
        <OrgProfileTab />
      </OrgTabbedPage>
    </Page>
    <Switch>
      <Route path="/orgs/:orgID/about/rename" component={RenameOrgOverlay} />
      {/* TODO(ariel): guard against this route for only free users */}
      <Route path="/orgs/:orgID/about/delete" component={DeleteOrgOverlay} />
    </Switch>
  </>
)

export default OrgProfilePage
