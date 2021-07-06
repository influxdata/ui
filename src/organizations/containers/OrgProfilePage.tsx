// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {Switch, Route} from 'react-router-dom'

// Components
import OrgTabbedPage from 'src/organizations/components/OrgTabbedPage'
import OrgHeader from 'src/organizations/components/OrgHeader'
import {Page} from '@influxdata/clockface'
import OrgProfileTab from 'src/organizations/components/OrgProfileTab'
import RenameOrgOverlay from 'src/organizations/components/RenameOrgOverlay'
import DeleteOrgOverlay from 'src/organizations/components/DeleteOrgOverlay'
import UsersProvider from 'src/users/context/users'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {getQuartzMe} from 'src/me/selectors'

const OrgProfilePage: FC = () => {
  const quartzMe = useSelector(getQuartzMe)

  return (
    <>
      <Page titleTag={pageTitleSuffixer(['About', 'Organization'])}>
        <OrgHeader />
        <OrgTabbedPage activeTab="about">
          <UsersProvider>
            <OrgProfileTab />
          </UsersProvider>
        </OrgTabbedPage>
      </Page>
      <Switch>
        <Route path="/orgs/:orgID/about/rename" component={RenameOrgOverlay} />
        {quartzMe?.accountType === 'free' && (
          <Route
            path="/orgs/:orgID/about/delete"
            component={DeleteOrgOverlay}
          />
        )}
      </Switch>
    </>
  )
}

export default OrgProfilePage
