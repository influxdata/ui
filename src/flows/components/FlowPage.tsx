// Libraries
import React, {FC, useContext, useEffect} from 'react'
import {useParams} from 'react-router-dom'

// Components
import CurrentFlowProvider from 'src/flows/context/flow.current'
import {RunModeProvider} from 'src/flows/context/runMode'
import {FlowListContext} from 'src/flows/context/flow.list'
import Flow from 'src/flows/components/Flow'
import {Page} from '@influxdata/clockface'
import FlowHeader from 'src/flows/components/header'
import {ResultsProvider} from 'src/flows/context/results'
import {PROJECT_NAME_PLURAL} from 'src/flows'

const FlowFromRoute = () => {
  const {id} = useParams<{id: string}>()
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

const FlowContainer: FC = () => (
  <CurrentFlowProvider>
    <RunModeProvider>
      <FlowFromRoute />
      <ResultsProvider>
        <Page titleTag={PROJECT_NAME_PLURAL}>
          <FlowHeader />
          <Page.Contents
            fullWidth={true}
            scrollable={true}
            className="flow-page"
          >
            <Flow />
          </Page.Contents>
        </Page>
      </ResultsProvider>
    </RunModeProvider>
  </CurrentFlowProvider>
)

export default FlowContainer
