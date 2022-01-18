// Libraries
import React, {FC, useContext, useEffect} from 'react'
import {useParams} from 'react-router-dom'
import {Page} from '@influxdata/clockface'
import {DapperScrollbars} from '@influxdata/clockface'

// Contexts
import CurrentFlowProvider, {FlowContext} from 'src/flows/context/flow.current'
import QueryProvider from 'src/shared/contexts/query'
import {FlowQueryProvider, FlowQueryContext} from 'src/flows/context/flow.query'
import {FlowListContext} from 'src/flows/context/flow.list'
import {PopupDrawer, PopupProvider} from 'src/flows/context/popup'
import {ResultsProvider} from 'src/flows/context/results'
import {SidebarProvider} from 'src/flows/context/sidebar'

// Components
import PipeList from 'src/flows/components/PipeList'
import {SubSideBar} from 'src/flows/components/Sidebar'
import FlowHeader from 'src/flows/components/header'
import FlowKeyboardPreview from 'src/flows/components/FlowKeyboardPreview'

// Constants
import {PROJECT_NAME_PLURAL} from 'src/flows'

import 'src/flows/style.scss'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {event} from 'src/cloud/utils/reporting'
import {BucketsCacheProvider} from '../context/buckets.cached'

const FlowFromRoute = () => {
  const {id} = useParams<{id: string}>()
  const {change, flows, currentID} = useContext(FlowListContext)

  useEffect(() => {
    change(id)
  }, [id, change])

  useEffect(() => {
    if (currentID !== null) {
      event('Notebook Accessed', {notebookID: currentID})
    }
  }, [currentID])

  document.title = pageTitleSuffixer([
    flows[currentID]?.name,
    PROJECT_NAME_PLURAL,
  ])

  return null
}

const RunOnMount = () => {
  const {queryAll} = useContext(FlowQueryContext)
  const {flow} = useContext(FlowContext)

  useEffect(() => {
    if (flow.readOnly) {
      queryAll()
    }
  }, [])

  return null
}

export const FlowPage: FC = () => (
  <ResultsProvider>
    <FlowQueryProvider>
      <RunOnMount />
      <FlowKeyboardPreview />
      <SidebarProvider>
        <Page>
          <FlowHeader />
          <Page.Contents
            fullWidth={true}
            scrollable={false}
            className="flow-page"
          >
            <PopupProvider>
              <DapperScrollbars
                noScrollX
                thumbStartColor="gray"
                thumbStopColor="gray"
              >
                <PipeList />
              </DapperScrollbars>
              <SubSideBar />
              <PopupDrawer />
            </PopupProvider>
          </Page.Contents>
        </Page>
      </SidebarProvider>
    </FlowQueryProvider>
  </ResultsProvider>
)

export default () => (
  <QueryProvider>
    <CurrentFlowProvider>
      <FlowFromRoute />
      <BucketsCacheProvider>
        <FlowPage />
      </BucketsCacheProvider>
    </CurrentFlowProvider>
  </QueryProvider>
)
