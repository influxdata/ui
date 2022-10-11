// Libraries
import React, {FC, useContext, useEffect} from 'react'
import {Page} from '@influxdata/clockface'
import {DapperScrollbars} from '@influxdata/clockface'

// Contexts
import CurrentFlowProvider, {FlowContext} from 'src/flows/context/flow.current'
import {QueryProvider} from 'src/shared/contexts/query'
import {FlowQueryProvider, FlowQueryContext} from 'src/flows/context/flow.query'
import {PopupDrawer, PopupProvider} from 'src/flows/context/popup'
import {ResultsProvider} from 'src/flows/context/results'
import {SidebarProvider} from 'src/flows/context/sidebar'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Constants
import {GLOBAL_HEADER_HEIGHT} from 'src/identity/components/GlobalHeader/constants'

// Components
import PipeList from 'src/flows/components/PipeList'
import {SubSideBar} from 'src/flows/components/Sidebar'
import FlowHeader from 'src/flows/components/header'
import FlowKeyboardPreview from 'src/flows/components/FlowKeyboardPreview'

import 'src/flows/style.scss'

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

const flowPageHeight = {
  height: isFlagEnabled('multiOrg')
    ? `calc(100% - ${GLOBAL_HEADER_HEIGHT}px)`
    : '100%',
}

export const FlowPage: FC = () => (
  <ResultsProvider>
    <FlowQueryProvider>
      <RunOnMount />
      <FlowKeyboardPreview />
      <SidebarProvider>
        <Page style={flowPageHeight}>
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
      <FlowPage />
    </CurrentFlowProvider>
  </QueryProvider>
)
