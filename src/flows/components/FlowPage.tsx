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
import {Provider as SidebarProvider} from 'src/flows/context/sidebar'

// Components
import PipeList from 'src/flows/components/PipeList'
import Sidebar from 'src/flows/components/Sidebar'
import FlowHeader from 'src/flows/components/header'
import FlowKeyboardPreview from 'src/flows/components/FlowKeyboardPreview'

// Constants
import {PROJECT_NAME_PLURAL} from 'src/flows'

import 'src/flows/style.scss'

const FlowFromRoute = () => {
  const {id} = useParams<{id: string}>()
  const {change} = useContext(FlowListContext)

  useEffect(() => {
    change(id)
  }, [id, change])

  return null
}

const FlowContainer: FC = () => (
  <QueryProvider>
    <CurrentFlowProvider>
      <RunModeProvider>
        <FlowFromRoute />
        <ResultsProvider>
          <FlowQueryProvider>
            <FlowKeyboardPreview />
            <Page titleTag={PROJECT_NAME_PLURAL}>
              <FlowHeader />
              <Page.Contents
                fullWidth={true}
                scrollable={true}
                className="flow-page"
              >
                <PopupProvider>
                  <SidebarProvider>
                    <PipeList />
                    <Sidebar />
                    <PopupDrawer />
                  </SidebarProvider>
                </PopupProvider>
              </Page.Contents>
            </Page>
          </FlowQueryProvider>
        </ResultsProvider>
      </RunModeProvider>
    </CurrentFlowProvider>
  </QueryProvider>
)

export default FlowContainer
