// Libraries
import React, {FC, useContext, useEffect} from 'react'
import {AppWrapper, DapperScrollbars, Page} from '@influxdata/clockface'
import {useParams} from 'react-router'
import {fromFlux} from '@influxdata/giraffe'

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
import NotFound from 'src/shared/components/NotFound'

import 'src/flows/style.scss'
import 'src/flows/shared/Resizer.scss'
import '@influxdata/clockface/dist/index.css'
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
          const csv = fromFlux(resp)
          setResult(id, {parsed: csv, source: ''})
          setStatuses({[id]: RemoteDataState.Done})
        })
    })
  }, [flow])

  return null
}

const ReadOnly: FC = ({children}) => {
  const {flow} = useContext(FlowContext)
  const params = useParams<{accessID: string}>()
  if (!params.accessID || params.accessID.length !== 16 || !flow) {
    return (
      <div style={{width: '100%'}}>
        <NotFound />
      </div>
    )
  }
  return <>{children}</>
}

const ReadOnlyFlowPage: FC = () => {
  const {flow} = useContext(FlowContext)

  return (
  <Page titleTag={flow.name + " (Shared) | InfluxDB Cloud"}>
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
  )
}

const FlowContainer: FC = () => (
  <AppWrapper>
    <FlowProvider>
      <ReadOnly>
        <ResultsProvider>
          <FlowQueryProvider>
            <RunPipeResults />
            <SidebarProvider>
            <ReadOnlyFlowPage />
            </SidebarProvider>
          </FlowQueryProvider>
        </ResultsProvider>
      </ReadOnly>
    </FlowProvider>
  </AppWrapper>
)

export default FlowContainer
