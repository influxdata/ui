// Libraries
import React, {FC} from 'react'
import {Switch, Route} from 'react-router-dom'
import {Page} from '@influxdata/clockface'

// Components
import OrgTabbedPage from 'src/organizations/components/OrgTabbedPage'
import OrgHeader from 'src/organizations/components/OrgHeader'
import OrgProfileTab from 'src/organizations/components/OrgProfileTab'
import RenameOrgOverlay from 'src/organizations/components/RenameOrgOverlay'

// Constants
import {CLOUD} from 'src/shared/constants'

// Context Providers
import {UsersProvider} from 'src/users/context/users'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

const OrgProfilePage: FC = () => {
  return (
    <>
      <Page titleTag={pageTitleSuffixer(['Settings', 'Organization'])}>
        <OrgHeader testID="about-page--header" />
        <OrgTabbedPage activeTab="about">
          {CLOUD ? (
            <UsersProvider>
              <OrgProfileTab />
            </UsersProvider>
          ) : (
            <OrgProfileTab />
          )}
        </OrgTabbedPage>
      </Page>
      <Switch>
        <Route
          path="/orgs/:orgID/org-settings/rename"
          component={RenameOrgOverlay}
        />
      </Switch>
    </>
  )
}

export default OrgProfilePage
