// Libraries
import React, {useEffect, useState, FC, Suspense, lazy} from 'react'
import {connect, ConnectedProps, useDispatch} from 'react-redux'
import {Route, Switch} from 'react-router-dom'

// Components
import {MePage} from 'src/me'
import DashboardsIndex from 'src/dashboards/components/dashboard_index/DashboardsIndex'
import DashboardContainer from 'src/dashboards/components/DashboardContainer'
import FlowPage from 'src/flows/components/FlowPage'
import BucketsIndex from 'src/buckets/containers/BucketsIndex'
import TokensIndex from 'src/authorizations/containers/TokensIndex'
import TelegrafsPage from 'src/telegrafs/containers/TelegrafsPage'
import ScrapersIndex from 'src/scrapers/containers/ScrapersIndex'
import WriteDataPage from 'src/writeData/containers/WriteDataPage'
import VariablesIndex from 'src/variables/containers/VariablesIndex'
import LabelsIndex from 'src/labels/containers/LabelsIndex'
import OrgProfilePage from 'src/organizations/containers/OrgProfilePage'
import MembersIndex from 'src/members/containers/MembersIndex'
import RouteToDashboardList from 'src/dashboards/components/RouteToDashboardList'
import ClientLibrariesPage from 'src/writeData/containers/ClientLibrariesPage'
import TelegrafPluginsPage from 'src/writeData/containers/TelegrafPluginsPage'
import FlowsIndex from 'src/flows/components/FlowsIndex'
import NotFound from 'src/shared/components/NotFound'
import UsersPage from 'src/unity/components/users/UsersPage'
import {CommunityTemplatesIndex} from 'src/templates/containers/CommunityTemplatesIndex'
import {AnnotationsIndex} from 'src/annotations/containers/AnnotationsIndex'
import PageSpinner from 'src/perf/components/PageSpinner'
const AlertingIndex = lazy(() =>
  import('src/alerting/components/AlertingIndex')
)
const AlertHistoryIndex = lazy(() =>
  import('src/alerting/components/AlertHistoryIndex')
)
const CheckHistory = lazy(() => import('src/checks/components/CheckHistory'))
const TaskRunsPage = lazy(() => import('src/tasks/components/TaskRunsPage'))
const TaskEditPage = lazy(() => import('src/tasks/containers/TaskEditPage'))
const TaskPage = lazy(() => import('src/tasks/containers/TaskPage'))
const TasksPage = lazy(() => import('src/tasks/containers/TasksPage'))
const DataExplorerPage = lazy(() =>
  import('src/dataExplorer/components/DataExplorerPage')
)

// Types
import {AppState, Organization, ResourceType} from 'src/types'

// Constants
import {CLOUD} from 'src/shared/constants'
import {PROJECT_NAME_PLURAL} from 'src/flows'
import {
  LOAD_DATA,
  TELEGRAF_PLUGINS,
  CLIENT_LIBS,
  SETTINGS,
  ANNOTATIONS,
  VARIABLES,
  LABELS,
  BUCKETS,
  SCRAPERS,
  TEMPLATES,
  TOKENS,
  TELEGRAFS,
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
    <Suspense fallback={<PageSpinner />}>
      <PageSpinner loading={loading}>
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
            path={`${orgPath}/${LOAD_DATA}/${CLIENT_LIBS}`}
            component={ClientLibrariesPage}
          />
          <Route
            path={`${orgPath}/${LOAD_DATA}/${TELEGRAF_PLUGINS}`}
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
          {isFlagEnabled('annotations') && (
            <Route
              path={`${orgPath}/${SETTINGS}/${ANNOTATIONS}`}
              component={AnnotationsIndex}
            />
          )}
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
            exact
            path={`${orgPath}/${SETTINGS}`}
            component={VariablesIndex}
          />

          {/* Users */}
          {CLOUD && isFlagEnabled('unity') && (
            <Route path={`${orgPath}/unity-users`} component={UsersPage} />
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
      </PageSpinner>
    </Suspense>
  )
}

const mstp = (state: AppState) => {
  const orgs = getAll<Organization>(state, ResourceType.Orgs)

  return {orgs}
}

const connector = connect(mstp)

export default connector(SetOrg)
