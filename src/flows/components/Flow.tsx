// Libraries
import React, {FC, useContext, useEffect} from 'react'
import {useParams} from 'react-router-dom'
import {Switch, Route} from 'react-router-dom'

// Components
import {ResultsProvider} from 'src/flows/context/results'
import {RefProvider} from 'src/flows/context/refs'
import CurrentFlowProvider from 'src/flows/context/flow.current'
import {FlowListContext} from 'src/flows/context/flow.list'
import OverlayProvider from 'src/flows/context/overlay'
import DashboardOverlayProvider from 'src/flows/context/dashboardOverlay'
import FlowPage from 'src/flows/components/FlowPage'
import ExportTaskOverlay from 'src/flows/components/ExportTaskOverlay/ExportTaskOverlay'
import ExportDashboardOverlay from 'src/flows/components/ExportDashboardOverlay/ExportDashboardOverlay'

const FlowFromRoute = () => {
  const {id} = useParams()
  const {change} = useContext(FlowListContext)

  useEffect(() => {
    change(id)
  }, [id, change])

  return null
}
// NOTE: uncommon, but using this to scope the project
// within the page and not bleed it's dependencies outside
// of the feature flag
import 'src/flows/style.scss'

const FlowContainer: FC = () => {
  return (
    <CurrentFlowProvider>
      <FlowFromRoute />
      <ResultsProvider>
        <RefProvider>
          <OverlayProvider>
            <DashboardOverlayProvider>
              <Switch>
                <Route
                  path="/orgs/:orgID/flows/:id/export-task"
                  component={ExportTaskOverlay}
                />
                <Route
                  path="/orgs/:orgID/flows/:id/export-dashboard"
                  component={ExportDashboardOverlay}
                />
              </Switch>
            </DashboardOverlayProvider>
          </OverlayProvider>
          <FlowPage />
        </RefProvider>
      </ResultsProvider>
    </CurrentFlowProvider>
  )
}

export default FlowContainer
