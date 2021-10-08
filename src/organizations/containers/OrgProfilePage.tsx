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
import {getQuartzMe} from 'src/me/selectors'
import DeleteOrgProvider from 'src/organizations/components/DeleteOrgContext'

// Constants
import {CLOUD} from 'src/shared/constants'

const OrgProfilePage: FC = () => {
  const quartzMe = useSelector(getQuartzMe)

  return (
    <>
      <Page titleTag={pageTitleSuffixer(['About', 'Organization'])}>
        <OrgHeader testID="about-page--header" />
        <OrgTabbedPage activeTab="about">
          <OrgProfileTab />
        </OrgTabbedPage>
      </Page>
      <Switch>
        <Route path="/orgs/:orgID/about/rename" component={RenameOrgOverlay} />
        {CLOUD && quartzMe?.accountType === 'free' && (
          <DeleteOrgProvider>
            <Route
              path="/orgs/:orgID/about/delete"
              component={DeleteOrgOverlay}
            />
          </DeleteOrgProvider>
        )}
      </Switch>
    </>
  )
}

export default OrgProfilePage
