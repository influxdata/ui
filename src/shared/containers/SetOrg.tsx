// Libraries
import React, {useEffect, useState, FC, Suspense} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Route, Switch, useHistory, useParams} from 'react-router-dom'

// Components
import {CommunityTemplatesIndex} from 'src/templates/containers/CommunityTemplatesIndex'
import PageSpinner from 'src/perf/components/PageSpinner'

import {
  AlertHistoryIndex,
  AlertingIndex,
  ArduinoWizard,
  BillingPage,
  BucketsIndex,
  CheckHistory,
  ClientLibrariesPage,
  CliWizard,
  DashboardContainer,
  DashboardsIndex,
  DataExplorerPage,
  FileUploadsPage,
  FlowPage,
  FlowsIndex,
  HomepageContainer,
  NodejsWizard,
  PythonWizard,
  LabelsIndex,
  MembersIndex,
  NotFound,
  OrgProfilePage,
  RouteToDashboardList,
  ScrapersIndex,
  SecretsIndex,
  TaskEditPage,
  TaskImportOverlay,
  TaskPage,
  TaskRunsPage,
  TasksPage,
  TelegrafPluginsPage,
  TelegrafsPage,
  TokensIndex,
  UsagePage,
  UserAccountPage,
  UsersPage,
  VariablesIndex,
  VersionPage,
  SubscriptionsLanding,
  CreateSubscriptionForm,
  WriteDataPage,
  DetailsSubscriptionPage,
  GoWizard,
} from 'src/shared/containers'
import {OrganizationList} from 'src/cloud/containers'

import {UserProfilePage} from 'src/identity/components/userprofile/UserProfilePage'

// Types
import {AppState, Organization, ResourceType} from 'src/types'

// Constants
import {CLOUD} from 'src/shared/constants'
import {PROJECT_NAME_PLURAL} from 'src/flows'
import {
  LOAD_DATA,
  SETTINGS,
  VARIABLES,
  LABELS,
  BUCKETS,
  SCRAPERS,
  TEMPLATES,
  TOKENS,
  TELEGRAFS,
  FILE_UPLOAD,
  CLIENT_LIBS,
  TELEGRAF_PLUGINS,
  SECRETS,
  SUBSCRIPTIONS,
} from 'src/shared/constants/routes'

// Actions
import {setOrg} from 'src/organizations/actions/creators'

// Utils
import {updateReportingContext} from 'src/cloud/utils/reporting'

// Decorators
import {RemoteDataState} from '@influxdata/clockface'

// Selectors
import {getAll} from 'src/resources/selectors'

const SetOrg: FC = () => {
  const [loading, setLoading] = useState(RemoteDataState.Loading)
  const dispatch = useDispatch()
  const orgs = useSelector((state: AppState) =>
    getAll<Organization>(state, ResourceType.Orgs)
  )
  const history = useHistory()
  const {orgID} = useParams<{orgID: string}>()

  const foundOrg = orgs.find(o => o.id === orgID)
  const firstOrgID = orgs[0]?.id

  useEffect(() => {
    // does orgID from url match any orgs that exist
    if (foundOrg) {
      dispatch(setOrg(foundOrg))
      updateReportingContext({orgID: orgID})
      setLoading(RemoteDataState.Done)
      return
    }
    updateReportingContext({orgID: null})

    if (!orgs.length) {
      history.push(`/no-orgs`)
      return
    }

    // else default to first org
    history.push(`/orgs/${firstOrgID}`)
  }, [orgID, firstOrgID, foundOrg, dispatch, history, orgs.length])

  const orgPath = '/orgs/:orgID'

  return (
    <PageSpinner loading={loading}>
      <Suspense fallback={<PageSpinner />}>
        <Switch>
          {/* Alerting */}
          <Route path={`${orgPath}/alerting`} component={AlertingIndex} />
          <Route
            path={`${orgPath}/alert-history`}
            component={AlertHistoryIndex}
          />
          <Route path={`${orgPath}/checks/:checkID`} component={CheckHistory} />
          {/* Tasks */}
          <Route path={`${orgPath}/tasks/:id/runs`} component={TaskRunsPage} />
          <Route path={`${orgPath}/tasks/:id/edit`} component={TaskEditPage} />
          <Route path={`${orgPath}/tasks/new`} component={TaskPage} />
          <Route
            path={`${orgPath}/tasks/import`}
            component={TaskImportOverlay}
          />
          <Route path={`${orgPath}/tasks`} component={TasksPage} />
          {/* Data Explorer */}
          <Route
            path={`${orgPath}/data-explorer`}
            component={DataExplorerPage}
          />
          {/* Dashboards */}
          <Route
            path={`${orgPath}/dashboards-list`}
            component={DashboardsIndex}
          />
          <Route
            path={`${orgPath}/dashboards/:dashboardID`}
            component={DashboardContainer}
          />
          <Route
            exact
            path={`${orgPath}/dashboards`}
            component={RouteToDashboardList}
          />
          {/* Flows  */}
          <Route
            path={`${orgPath}/${PROJECT_NAME_PLURAL.toLowerCase()}/:notebookID/versions/:id`}
            component={VersionPage}
          />
          <Route
            path={`${orgPath}/${PROJECT_NAME_PLURAL.toLowerCase()}/:id`}
            component={FlowPage}
          />
          <Route
            path={`${orgPath}/${PROJECT_NAME_PLURAL.toLowerCase()}`}
            component={FlowsIndex}
          />
          {/* Write Data */}
          <Route
            path={`${orgPath}/${LOAD_DATA}/sources`}
            component={WriteDataPage}
          />
          <Route
            path={`${orgPath}/${LOAD_DATA}/${FILE_UPLOAD}/:contentID`}
            component={FileUploadsPage}
          />
          <Route
            path={`${orgPath}/${LOAD_DATA}/${CLIENT_LIBS}/:contentID`}
            component={ClientLibrariesPage}
          />
          <Route
            path={`${orgPath}/${LOAD_DATA}/${TELEGRAF_PLUGINS}/:contentID`}
            component={TelegrafPluginsPage}
          />
          {/* Load Data */}
          <Route
            exact
            path={`${orgPath}/${LOAD_DATA}`}
            component={WriteDataPage}
          />
          <Route
            path={`${orgPath}/${LOAD_DATA}/${SCRAPERS}`}
            component={ScrapersIndex}
          />
          <Route
            path={`${orgPath}/${LOAD_DATA}/${TELEGRAFS}`}
            component={TelegrafsPage}
          />
          <Route
            path={`${orgPath}/${LOAD_DATA}/${TOKENS}`}
            component={TokensIndex}
          />
          <Route
            path={`${orgPath}/${LOAD_DATA}/${BUCKETS}`}
            component={BucketsIndex}
          />
          {CLOUD && (
            <Route
              path={`${orgPath}/${LOAD_DATA}/${SUBSCRIPTIONS}/create`}
              component={CreateSubscriptionForm}
            />
          )}
          {CLOUD && (
            <Route
              path={`${orgPath}/${LOAD_DATA}/${SUBSCRIPTIONS}/:id/notifications`}
              render={props => (
                <DetailsSubscriptionPage {...props} showNotifications={true} />
              )}
            />
          )}
          {CLOUD && (
            <Route
              path={`${orgPath}/${LOAD_DATA}/${SUBSCRIPTIONS}/:id`}
              component={DetailsSubscriptionPage}
            />
          )}
          {CLOUD && (
            <Route
              path={`${orgPath}/${LOAD_DATA}/${SUBSCRIPTIONS}`}
              component={SubscriptionsLanding}
            />
          )}
          {/* Settings */}
          <Route
            path={`${orgPath}/${SETTINGS}/${VARIABLES}`}
            component={VariablesIndex}
          />
          <Route
            path={`${orgPath}/${SETTINGS}/${TEMPLATES}`}
            component={CommunityTemplatesIndex}
          />
          <Route
            exact
            path={`${orgPath}/${SETTINGS}/${LABELS}`}
            component={LabelsIndex}
          />
          <Route
            path={`${orgPath}/${SETTINGS}/${SECRETS}`}
            component={SecretsIndex}
          />
          <Route
            exact
            path={`${orgPath}/${SETTINGS}`}
            component={VariablesIndex}
          />
          {/* Users - route has multiple paths to ensure backwards compatibility while https://github.com/influxdata/ui/issues/5396 is being worked on*/}
          {CLOUD && (
            <Route
              path={[`${orgPath}/users`, `${orgPath}/members`]}
              component={UsersPage}
            />
          )}
          {/* Billing */}
          {CLOUD && (
            <Route path={`${orgPath}/billing`} component={BillingPage} />
          )}
          {/* Usage */}
          {CLOUD && <Route path={`${orgPath}/usage`} component={UsagePage} />}
          {/* Members */}
          {!CLOUD && (
            <Route path={`${orgPath}/members`} component={MembersIndex} />
          )}
          {/* About - route has multiple paths to ensure backwards compatibility while https://github.com/influxdata/ui/issues/5396 is being worked on*/}
          <Route
            path={[`${orgPath}/about`, `${orgPath}/org-settings`]}
            component={OrgProfilePage}
          />
          {/* account settings page */}
          {CLOUD && (
            <Route
              path={`${orgPath}/accounts/settings`}
              component={UserAccountPage}
            />
          )}
          {/* list of organizations in the user's current CLOUD account */}
          {CLOUD && (
            <Route
              path={`${orgPath}/accounts/orglist`}
              component={OrganizationList}
            />
          )}
          {/* Homepage / First Mile */}
          <Route exact path="/orgs/:orgID" component={HomepageContainer} />
          <Route
            exact
            path="/orgs/:orgID/new-user-setup/python"
            key="/python"
            component={PythonWizard}
          />
          <Route
            exact
            path="/orgs/:orgID/new-user-setup/nodejs"
            key="/nodejs"
            component={NodejsWizard}
          />
          <Route
            exact
            path="/orgs/:orgID/new-user-setup/golang"
            key="/golang"
            component={GoWizard}
          />
          <Route
            exact
            path="/orgs/:orgID/new-user-setup/arduino"
            key="/arduino"
            component={ArduinoWizard}
          />
          <Route
            exact
            path="/orgs/:orgID/new-user-setup/cli"
            component={CliWizard}
          />
          {/* User Profile Page */}
          {CLOUD && (
            <Route
              exact
              path="/orgs/:orgId/user/profile"
              component={UserProfilePage}
            />
          )}
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </PageSpinner>
  )
}

export default SetOrg
