// Libraries
import React, {FC} from 'react'
import {
  AppWrapper,
  FlexBox,
  FlexBoxChild,
  FlexDirection,
  Page,
} from '@influxdata/clockface'

import {
  Route,
  RouteComponentProps,
  Router,
  Switch,
  withRouter,
} from 'react-router-dom'
// Components
import AppPageHeader from 'src/operator/AppPageHeader'
import {Resource, User} from 'src/types/operator'
// import ResourcesTable from 'src/operator/ResourcesTable'
// import {
//   getAccounts,
//   getOrgsLimits,
//   getOrg,
//   getOperatorOrg,
//   putOrgsLimits,
// } from 'src/client/unityRoutes'
// import {accountColumnInfo, organizationColumnInfo} from 'src/operator/constants'
import OperatorNav from 'src/operator/OperatorNav'
// import OrgOverlay from 'src/operator/OrgOverlay'

interface Props {
  operator: User
  fetchResources?: (searchTerm?: string) => Promise<Resource[]>
}

const Operator: FC<Props & RouteComponentProps> = ({
  operator,
  // fetchResources,
  history,
}) => {
  return (
    <Router history={history}>
      <AppWrapper>
        <Page titleTag="Operator UI">
          <FlexBox direction={FlexDirection.Row}>
            <FlexBoxChild>
              <AppPageHeader title="Cloud 2.0 Resources" />
            </FlexBoxChild>
            <OperatorNav operator={operator} />
          </FlexBox>
          <Page.Contents scrollable={true}>
            <Switch>
              <Route path="/operator/organizations">
                {/* <ResourcesTable
                  infos={organizationColumnInfo}
                  fetchResources={fetchResources || getOperatorOrg}
                  tabName="organizations"
                  searchBarPlaceholder="Filter organizations by id..."
                /> */}

                <Switch>
                  <Route path="/operator/organizations/:orgID">
                    {/* <OrgOverlay
                      fetchOrganization={getOrg}
                      fetchLimits={getOrgsLimits}
                      updateLimits={putOrgsLimits}
                    /> */}
                  </Route>
                </Switch>
              </Route>
              <Route path="/operator">
                {/* <ResourcesTable
                  infos={accountColumnInfo}
                  fetchResources={fetchResources || getAccounts}
                  tabName="accounts"
                  searchBarPlaceholder="Filter accounts by email..."
                /> */}
              </Route>
            </Switch>
          </Page.Contents>
        </Page>
      </AppWrapper>
    </Router>
  )
}

export default withRouter(Operator)
