// Libraries
import React, {FC, useContext, useEffect} from 'react'
import {useParams} from 'react-router-dom'
import {Page} from '@influxdata/clockface'

// Contexts
import CurrentFlowProvider from 'src/flows/context/flow.current'
import {RunModeProvider} from 'src/flows/context/runMode'
import QueryProvider from 'src/flows/context/query'
import {FlowQueryProvider} from 'src/flows/context/flow.query'
import {FlowListContext} from 'src/flows/context/flow.list'
import {PopupDrawer, PopupProvider} from 'src/flows/context/popup'
import {ResultsProvider} from 'src/flows/context/results'

// Components
import PipeList from 'src/flows/components/PipeList'
import FlowHeader from 'src/flows/components/header'
import FlowKeyboardPreview from 'src/flows/components/FlowKeyboardPreview'

// Constants
import {PROJECT_NAME_PLURAL} from 'src/flows'

import 'src/flows/style.scss'

import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

const FlowFromRoute = () => {
  const {id} = useParams<{id: string}>()
  const {change, flows, currentID} = useContext(FlowListContext)

  useEffect(() => {
    change(id)
  }, [id, change])

  document.title = pageTitleSuffixer([
    flows[currentID]?.name,
    PROJECT_NAME_PLURAL,
  ])

  return null
}

const FlowContainer: FC = () => {
  return (
    <QueryProvider>
      <CurrentFlowProvider>
        <RunModeProvider>
          <FlowFromRoute />
          <ResultsProvider>
            <FlowQueryProvider>
              <FlowKeyboardPreview />
              <Page>
                <FlowHeader />
                <Page.Contents
                  fullWidth={true}
                  scrollable={true}
                  className="flow-page"
                >
                  <PopupProvider>
                    <PipeList />
                    <PopupDrawer />
                  </PopupProvider>
                </Page.Contents>
              </Page>
            </FlowQueryProvider>
          </ResultsProvider>
        </RunModeProvider>
      </CurrentFlowProvider>
    </QueryProvider>
  )
}
export default FlowContainer
