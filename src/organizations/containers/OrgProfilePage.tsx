// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {Switch, Route} from 'react-router-dom'
import {Page} from '@influxdata/clockface'

// Components
import OrgTabbedPage from 'src/organizations/components/OrgTabbedPage'
import OrgHeader from 'src/organizations/components/OrgHeader'
import OrgProfileTab from 'src/organizations/components/OrgProfileTab'
import RenameOrgOverlay from 'src/organizations/components/RenameOrgOverlay'
import DeleteOrgOverlay from 'src/organizations/components/DeleteOrgOverlay'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {selectCurrentIdentity} from 'src/identity/selectors'
import DeleteOrgProvider from 'src/organizations/components/DeleteOrgContext'

// Constants
import {CLOUD} from 'src/shared/constants'

const OrgProfilePage: FC = () => {
  const {account} = useSelector(selectCurrentIdentity)

  return (
    <>
      <Page titleTag={pageTitleSuffixer(['Settings', 'Organization'])}>
        <OrgHeader testID="about-page--header" />
        <OrgTabbedPage activeTab="about">
          <OrgProfileTab />
        </OrgTabbedPage>
      </Page>
      <Switch>
        <Route
          path="/orgs/:orgID/org-settings/rename"
          component={RenameOrgOverlay}
        />
        {CLOUD && account.type === 'free' && (
          <DeleteOrgProvider>
            <Route
              path="/orgs/:orgID/org-settings/delete"
              component={DeleteOrgOverlay}
            />
          </DeleteOrgProvider>
        )}
      </Switch>
    </>
  )
}

export default OrgProfilePage
