// Libraries
import React, {FC, useContext, useEffect} from 'react'
import {AppWrapper, DapperScrollbars, Page} from '@influxdata/clockface'
import {useParams} from 'react-router'

// Contexts
import {FlowProvider} from 'src/flows/context/shared'
import {FlowContext} from 'src/flows/context/flow.current'
import {FlowQueryProvider} from 'src/flows/context/flow.query'
import {PopupDrawer, PopupProvider} from 'src/flows/context/popup'
import {ResultsContext, ResultsProvider} from 'src/flows/context/results'
import {SidebarProvider} from 'src/flows/context/sidebar'

// Components
import ReadOnlyPipeList from 'src/flows/components/ReadOnlyPipeList'
import {SubSideBar} from 'src/flows/components/Sidebar'
import ReadOnlyHeader from 'src/flows/components/ReadOnlyHeader'

import 'src/flows/style.scss'
import 'src/flows/shared/Resizer.scss'
import '@influxdata/clockface/dist/index.css'
import fromFlux from 'src/shared/utils/fromFlux'

const RunPipeResults: FC = () => {
  const {flow} = useContext(FlowContext)
  const {setResult} = useContext(ResultsContext)
  const {accessID} = useParams<{accessID}>()

  useEffect(() => {
    flow.data.allIDs.map(id =>
      fetch(`/api/share/${accessID}/query/${id}`)
        .then(res => res.text())
        .then(resp => {
          const csv = fromFlux(resp)
          setResult(id, {parsed: csv, source: ''})
        })
    )
  }, [flow])

  return null
}

const FlowContainer: FC = () => (
  <AppWrapper>
    <FlowProvider>
      <ResultsProvider>
        <RunPipeResults />
        <FlowQueryProvider>
          <SidebarProvider>
            <Page>
              <ReadOnlyHeader />
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
                    <ReadOnlyPipeList />
                  </DapperScrollbars>
                  <SubSideBar />
                  <PopupDrawer />
                </PopupProvider>
              </Page.Contents>
            </Page>
          </SidebarProvider>
        </FlowQueryProvider>
      </ResultsProvider>
    </FlowProvider>
  </AppWrapper>
)

export default FlowContainer
