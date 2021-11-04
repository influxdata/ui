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
import {AppSettingProvider} from 'src/shared/contexts/app'

// Components
import ReadOnlyPipeList from 'src/flows/components/ReadOnlyPipeList'
import {SubSideBar} from 'src/flows/components/Sidebar'
import ReadOnlyHeader from 'src/flows/components/ReadOnlyHeader'
import NotFound from 'src/shared/components/NotFound'

import 'src/flows/style.scss'
import 'src/flows/shared/Resizer.scss'
import '@influxdata/clockface/dist/index.css'
import {RemoteDataState} from 'src/types'
import {event} from 'src/cloud/utils/reporting'

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
        .then(res =>
          res.text().then(resp => {
            if (res.status == 200) {
              const csv = fromFlux(resp)
              setResult(id, {parsed: csv, source: ''})
              setStatuses({[id]: RemoteDataState.Done})
            } else {
              try {
                const json = JSON.parse(resp)
                setResult(id, {error: json.message || json.error})
              } catch (err) {
                setResult(id, {error: resp})
              }
              setStatuses({[id]: RemoteDataState.Error})
            }
          })
        )
        .catch(err => {
          console.error('failed to execute query', err)
          setStatuses({[id]: RemoteDataState.Error})
        })
    })
    event('Visited Shared Notebook', {accessID: accessID})
  }, [flow])

  return null
}

const ReadOnly: FC = ({children}) => {
  const {flow} = useContext(FlowContext)
  const params = useParams<{accessID: string}>()
  if (!params.accessID || !flow) {
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
    <Page titleTag={flow.name + ' (Shared) | InfluxDB Cloud'}>
      <ReadOnlyHeader />
      <Page.Contents fullWidth={true} scrollable={false} className="flow-page">
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
    <AppSettingProvider>
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
    </AppSettingProvider>
  </AppWrapper>
)

export default FlowContainer
