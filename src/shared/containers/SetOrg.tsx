// Libraries
import React, {useEffect, useState, FC, Suspense} from 'react'
import {connect, ConnectedProps, useDispatch} from 'react-redux'
import {Route, Switch} from 'react-router-dom'

// Components
import {CommunityTemplatesIndex} from 'src/templates/containers/CommunityTemplatesIndex'
import PageSpinner from 'src/perf/components/PageSpinner'
import {
  MePage,
  TasksPage,
  TaskPage,
  TaskRunsPage,
  TaskEditPage,
  DashboardsIndex,
  DataExplorerPage,
  DashboardContainer,
  FlowPage,
  BucketsIndex,
  TokensIndex,
  TelegrafsPage,
  ScrapersIndex,
  WriteDataPage,
  VariablesIndex,
  LabelsIndex,
  SecretsIndex,
  OrgProfilePage,
  AlertingIndex,
  AlertHistoryIndex,
  CheckHistory,
  MembersIndex,
  RouteToDashboardList,
  FlowsIndex,
  NotFound,
  UsersPage,
  UsagePage,
  BillingPage,
  FileUploadsPage,
  ClientLibrariesPage,
  TelegrafPluginsPage,
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
} from 'src/shared/constants/routes'

// Actions
import {setOrg} from 'src/organizations/actions/creators'

// Utils
import {updateReportingContext} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Decorators
import {RouteComponentProps} from 'react-router-dom'
import {RemoteDataState} from '@influxdata/clockface'

// Selectors
import {getAll} from 'src/resources/selectors'
import FunctionsRouter from 'src/functions/containers/FunctionsRouter'

interface OwnProps {
  children: React.ReactElement<any>
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & OwnProps & RouteComponentProps<{orgID: string}>

const SetOrg: FC<Props> = ({
  match: {
    params: {orgID},
  },
  orgs,
  history,
}) => {
  const [loading, setLoading] = useState(RemoteDataState.Loading)
  const dispatch = useDispatch()
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
          {isFlagEnabled('notebooks') && (
            <Route
              path={`${orgPath}/${PROJECT_NAME_PLURAL.toLowerCase()}/:id`}
              component={FlowPage}
            />
          )}

          {isFlagEnabled('notebooks') && (
            <Route
              path={`${orgPath}/${PROJECT_NAME_PLURAL.toLowerCase()}`}
              component={FlowsIndex}
            />
          )}

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
          {isFlagEnabled('secretsUI') && (
            <Route
              exact
              path={`${orgPath}/${SETTINGS}/${SECRETS}`}
              component={SecretsIndex}
            />
          )}
          <Route
            exact
            path={`${orgPath}/${SETTINGS}`}
            component={VariablesIndex}
          />

          {/* Users */}
          {CLOUD && isFlagEnabled('unityUsers') && (
            <Route path={`${orgPath}/users`} component={UsersPage} />
          )}

          {/* Billing */}
          {CLOUD && isFlagEnabled('unityBilling') && (
            <Route path={`${orgPath}/billing`} component={BillingPage} />
          )}

          {/* Usage */}
          {CLOUD && isFlagEnabled('unityUsage') && (
            <Route path={`${orgPath}/usage`} component={UsagePage} />
          )}

          {/* Managed Functions */}
          {CLOUD && isFlagEnabled('managed-functions') && (
            <Route path={`${orgPath}/functions`} component={FunctionsRouter} />
          )}

          {/* Members */}
          {!CLOUD && (
            <Route path={`${orgPath}/members`} component={MembersIndex} />
          )}

          {/* About */}
          <Route path={`${orgPath}/about`} component={OrgProfilePage} />

          {/* Getting Started */}
          <Route exact path="/orgs/:orgID" component={MePage} />

          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </PageSpinner>
  )
}

const mstp = (state: AppState) => {
  const orgs = getAll<Organization>(state, ResourceType.Orgs)

  return {orgs}
}

const connector = connect(mstp)

export default connector(SetOrg)
