// Libraries
import React, {FC, Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Switch, Route, useRouteMatch} from 'react-router-dom'

// Components
import {Page} from '@influxdata/clockface'
import {ErrorHandling} from 'src/shared/decorators/errors'
import DashboardHeader from 'src/dashboards/components/DashboardHeader'
import {DashboardCells} from 'src/shared/components/cells/DashboardCells'
import ManualRefresh from 'src/shared/components/ManualRefresh'
import {HoverTimeProvider} from 'src/dashboards/utils/hoverTime'
import VariablesControlBar from 'src/dashboards/components/variablesControlBar/VariablesControlBar'
import LimitChecker from 'src/cloud/components/LimitChecker'
import {EditViewVEO} from 'src/dashboards/components/EditVEO'
import {NewViewVEO} from 'src/dashboards/components/NewVEO'
import {
  AddNoteOverlay,
  EditNoteOverlay,
  EditAnnotationDashboardOverlay,
} from 'src/overlays/components'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {event} from 'src/cloud/utils/reporting'
import {resetQueryCache} from 'src/shared/apis/queryCache'

// Actions
import {fetchAndSetAnnotations} from 'src/annotations/actions/thunks'

// Selectors
import {getByID} from 'src/resources/selectors'

// Types
import {AppState, ResourceType, Dashboard} from 'src/types'
import {ManualRefreshProps} from 'src/shared/components/ManualRefresh'

type ReduxProps = ConnectedProps<typeof connector>
type Props = ManualRefreshProps & ReduxProps

import {
  ORGS,
  ORG_ID,
  DASHBOARDS,
  DASHBOARD_ID,
} from 'src/shared/constants/routes'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

const dashRoute = `/${ORGS}/${ORG_ID}/${DASHBOARDS}/${DASHBOARD_ID}`

const SingleDashboardPage: FC<ManualRefreshProps> = ({
  manualRefresh,
  onManualRefresh,
}) => {
  const {isExact} = useRouteMatch(dashRoute)

  if (!isExact) {
    return null
  }

  return (
    <>
      <DashboardHeader onManualRefresh={onManualRefresh} />
      <VariablesControlBar />
      <ErrorBoundary>
        <DashboardCells manualRefresh={manualRefresh} />
      </ErrorBoundary>
    </>
  )
}

@ErrorHandling
class DashboardPage extends Component<Props> {
  public componentDidMount() {
    resetQueryCache()

    this.emitRenderCycleEvent()

    this.props.fetchAndSetAnnotations()
  }

  public componentWillUnmount() {
    resetQueryCache()
  }

  public render() {
    const {manualRefresh, onManualRefresh} = this.props

    return (
      <ErrorBoundary>
        <Page titleTag={this.pageTitle} testID="dashboard-page">
          <LimitChecker>
            <HoverTimeProvider>
              <SingleDashboardPage
                manualRefresh={manualRefresh}
                onManualRefresh={onManualRefresh}
              />
              <Switch>
                <Route path={`${dashRoute}/cells/new`} component={NewViewVEO} />
                <Route
                  path={`${dashRoute}/cells/:cellID/edit`}
                  component={EditViewVEO}
                />
                <Route
                  path={`${dashRoute}/notes/new`}
                  component={AddNoteOverlay}
                />
                <Route
                  path={`${dashRoute}/notes/:cellID/edit`}
                  component={EditNoteOverlay}
                />
                <Route
                  path={`${dashRoute}/edit-annotation`}
                  component={EditAnnotationDashboardOverlay}
                />
              </Switch>
            </HoverTimeProvider>
          </LimitChecker>
        </Page>
      </ErrorBoundary>
    )
  }

  private get pageTitle(): string {
    const {dashboard} = this.props
    const title =
      dashboard && dashboard.name ? dashboard.name : 'Name this Dashboard'

    return pageTitleSuffixer([title])
  }

  private emitRenderCycleEvent = () => {
    const {dashboard, startVisitMs} = this.props

    const tags = {
      dashboardID: dashboard.id,
    }

    const now = new Date().getTime()
    const timeToAppearMs = now - startVisitMs

    const fields = {timeToAppearMs}
    event('Dashboard and Variable Initial Render', tags, fields)
  }
}

const mstp = (state: AppState) => {
  const dashboard = getByID<Dashboard>(
    state,
    ResourceType.Dashboards,
    state.currentDashboard.id
  )

  return {
    startVisitMs: state.perf.dashboard.byID[dashboard.id]?.startVisitMs,
    dashboard,
  }
}

const mdtp = {
  fetchAndSetAnnotations,
}

const connector = connect(mstp, mdtp)

export default connector(ManualRefresh(DashboardPage))
