// Libraries
import React, {FC, useContext, useEffect} from 'react'
import {AppWrapper, DapperScrollbars, Page} from '@influxdata/clockface'
import {useParams} from 'react-router'

// Contexts
import {FlowProvider} from 'src/flows/context/shared'
import {FlowQueryProvider, FlowQueryContext} from 'src/flows/context/flow.query'
import {PopupDrawer, PopupProvider} from 'src/flows/context/popup'
import {ResultsContext, ResultsProvider} from 'src/flows/context/results'
import {SidebarProvider} from 'src/flows/context/sidebar'
import {FlowContext} from 'src/flows/context/flow.current'

// Components
import ReadOnlyPipeList from 'src/flows/components/ReadOnlyPipeList'
import {SubSideBar} from 'src/flows/components/Sidebar'
import ReadOnlyHeader from 'src/flows/components/ReadOnlyHeader'
import {InternalFromFluxResult} from 'src/types/flows'

import 'src/flows/style.scss'
import 'src/flows/shared/Resizer.scss'
import '@influxdata/clockface/dist/index.css'
import fromFlux from 'src/shared/utils/fromFlux'
import {RemoteDataState} from 'src/types'

const RunPipeResults: FC = () => {
  const {generateMap} = useContext(FlowQueryContext)
  const {setResult, setStatuses} = useContext(ResultsContext)
  const {flow} = useContext(FlowContext)
  const {accessID} = useParams<{accessID}>()

  useEffect(() => {
    const map = generateMap()
      .filter(s => !!s?.visual)
      .map(s => s.id)

    setStatuses(
      map.reduce((a, c) => {
        a[c] = RemoteDataState.Loading
        return a
      }, {})
    )
    map.forEach(id => {
      fetch(`/api/share/${accessID}/query/${id}`)
        .then(res => res.text())
        .then(resp => {
          const csv = (fromFlux(resp) as unknown) as InternalFromFluxResult
          setResult(id, {parsed: csv, source: ''})
          setStatuses({[id]: RemoteDataState.Done})
        })
    })
  }, [flow])

  return null
}

const FlowContainer: FC = () => (
  <AppWrapper>
    <FlowProvider>
      <ResultsProvider>
        <FlowQueryProvider>
          <RunPipeResults />
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
