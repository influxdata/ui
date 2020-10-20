// Libraries
import React, {FC, useContext, useEffect} from 'react'
import {useParams} from 'react-router-dom'
import {Switch, Route} from 'react-router-dom'

// Components
import {ResultsProvider} from 'src/flows/context/results'
import {RefProvider} from 'src/flows/context/refs'
import CurrentFlowProvider from 'src/flows/context/flow.current'
import {FlowListContext} from 'src/flows/context/flow.list'
import {ScrollProvider} from 'src/flows/context/scroll'
import OverlayProvider from 'src/flows/context/overlay'
import FlowPage from 'src/flows/components/FlowPage'
import ExportTaskOverlay from 'src/flows/components/ExportTaskOverlay/ExportTaskOverlay'

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
          <ScrollProvider>
            <OverlayProvider>
              <Switch>
                {/* wrapping in a switch in anticipation of export to dashboard */}
                <Route
                  path="/orgs/:orgID/flows/:id/export-task"
                  component={ExportTaskOverlay}
                />
              </Switch>
            </OverlayProvider>
            <FlowPage />
          </ScrollProvider>
        </RefProvider>
      </ResultsProvider>
    </CurrentFlowProvider>
  )
}

export default FlowContainer
