// Libraries
import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Switch, Route} from 'react-router-dom'

// Components
import {Page} from '@influxdata/clockface'
import {ErrorHandling} from 'src/shared/decorators/errors'
import DashboardHeader from 'src/dashboards/components/DashboardHeader'
import DashboardComponent from 'src/dashboards/components/Dashboard'
import ManualRefresh from 'src/shared/components/ManualRefresh'
import {HoverTimeProvider} from 'src/dashboards/utils/hoverTime'
import VariablesControlBar from 'src/dashboards/components/variablesControlBar/VariablesControlBar'
import {AnnotationsControlBar} from 'src/annotations/components/controlBar/AnnotationsControlBar'
import LimitChecker from 'src/cloud/components/LimitChecker'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'
import EditVEO from 'src/dashboards/components/EditVEO'
import NewVEO from 'src/dashboards/components/NewVEO'
import {
  AddNoteOverlay,
  EditNoteOverlay,
  EditAnnotationDashboardOverlay,
  AutoRefreshOverlay,
} from 'src/overlays/components'
import {FeatureFlag} from 'src/shared/utils/featureFlag'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {event} from 'src/cloud/utils/reporting'
import {resetQueryCache} from 'src/shared/apis/queryCache'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

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

@ErrorHandling
class DashboardPage extends Component<Props> {
  public componentDidMount() {
    resetQueryCache()

    this.emitRenderCycleEvent()

    if (isFlagEnabled('annotations')) {
      this.props.fetchAndSetAnnotations()
    }
  }

  public componentWillUnmount() {
    resetQueryCache()
  }

  public render() {
    const {manualRefresh, onManualRefresh, showAnnotationBar} = this.props

    return (
      <>
        <ErrorBoundary>
          <Page titleTag={this.pageTitle}>
            <LimitChecker>
              <HoverTimeProvider>
                <DashboardHeader onManualRefresh={onManualRefresh} />
                <RateLimitAlert alertOnly={true} />
                <VariablesControlBar />
                <FeatureFlag name="annotations">
                  {showAnnotationBar && <AnnotationsControlBar />}
                </FeatureFlag>
                <ErrorBoundary>
                  <DashboardComponent manualRefresh={manualRefresh} />
                </ErrorBoundary>
              </HoverTimeProvider>
            </LimitChecker>
          </Page>
          <Switch>
            <Route path={`${dashRoute}/cells/new`} component={NewVEO} />
            <Route
              path={`${dashRoute}/cells/:cellID/edit`}
              component={EditVEO}
            />
            <Route path={`${dashRoute}/notes/new`} component={AddNoteOverlay} />
            <Route
              path={`${dashRoute}/notes/:cellID/edit`}
              component={EditNoteOverlay}
            />
            {isFlagEnabled('annotations') && (
              <Route
                path={`${dashRoute}/edit-annotation`}
                component={EditAnnotationDashboardOverlay}
              />
            )}
            {isFlagEnabled('new-auto-refresh') && (
              <Route
                path={`${dashRoute}/autorefresh`}
                component={AutoRefreshOverlay}
              />
            )}
          </Switch>
        </ErrorBoundary>
      </>
    )
  }

  private get pageTitle(): string {
    const {dashboard} = this.props
    const title = dashboard && dashboard.name ? dashboard.name : 'Loading...'

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

  const showAnnotationBar = state.userSettings.showAnnotationsControls ?? false

  return {
    startVisitMs: state.perf.dashboard.byID[dashboard.id]?.startVisitMs,
    dashboard,
    showAnnotationBar,
  }
}

const mdtp = {
  fetchAndSetAnnotations,
}

const connector = connect(mstp, mdtp)

interface OwnProps {}
export default connector(ManualRefresh<OwnProps>(DashboardPage))
