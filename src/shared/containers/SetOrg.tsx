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
  BillingPage,
  BucketsIndex,
  CheckHistory,
  ClientLibrariesPage,
  DashboardContainer,
  DashboardsIndex,
  DashboardsIndexPaginated,
  DataExplorerPage,
  FileUploadsPage,
  FlowPage,
  FlowsIndex,
  HomepageContainer,
  NodejsWizard,
  PythonWizard,
  LabelsIndex,
  MembersIndex,
  MePage,
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
  SubscriptionDetailsPage,
} from 'src/shared/containers'

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
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

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
          {isFlagEnabled('paginatedDashboards') ? (
            <Route
              path={`${orgPath}/dashboards-list`}
              component={DashboardsIndexPaginated}
            />
          ) : (
            <Route
              path={`${orgPath}/dashboards-list`}
              component={DashboardsIndex}
            />
          )}
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
          {isFlagEnabled('flowPublishLifecycle') && (
            <Route
              path={`${orgPath}/${PROJECT_NAME_PLURAL.toLowerCase()}/:notebookID/versions/:id`}
              component={VersionPage}
            />
          )}

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

          {CLOUD && isFlagEnabled('subscriptionsUI') && (
            <Route
              path={`${orgPath}/${LOAD_DATA}/${SUBSCRIPTIONS}/create`}
              component={CreateSubscriptionForm}
            />
          )}

          {CLOUD && isFlagEnabled('subscriptionsUI') && (
            <Route
              path={`${orgPath}/${LOAD_DATA}/${SUBSCRIPTIONS}/:id`}
              component={SubscriptionDetailsPage}
            />
          )}

          {CLOUD && isFlagEnabled('subscriptionsUI') && (
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

          {/* Users */}
          {CLOUD && <Route path={`${orgPath}/users`} component={UsersPage} />}

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

          {/* About */}
          <Route path={`${orgPath}/about`} component={OrgProfilePage} />

          {/* account settings page */}
          <Route
            path={`${orgPath}/accounts/settings`}
            component={UserAccountPage}
          />

          {/* Getting Started */}
          {isFlagEnabled('firstMile') ? (
            <Route exact path="/orgs/:orgID" component={HomepageContainer} />
          ) : (
            <Route exact path="/orgs/:orgID" component={MePage} />
          )}

          {isFlagEnabled('firstMile') && (
            <>
              <Route
                exact
                path="/orgs/:orgID/new-user-wizard/python"
                component={PythonWizard}
              />
              <Route
                exact
                path="/orgs/:orgID/new-user-wizard/nodejs"
                component={NodejsWizard}
              />
            </>
          )}

          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </PageSpinner>
  )
}

export default SetOrg
