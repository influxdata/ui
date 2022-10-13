// Libraries
import React, {FC, useContext} from 'react'
import {DapperScrollbars, Page} from '@influxdata/clockface'
import {useParams} from 'react-router'

// Contexts
import {VersionFlowProvider} from 'src/flows/context/version.read'
import {FlowQueryProvider} from 'src/flows/context/flow.query'
import {QueryProvider} from 'src/shared/contexts/query'
import {ResultsProvider} from 'src/flows/context/results'
import {PopupDrawer, PopupProvider} from 'src/flows/context/popup'
import {FlowContext} from 'src/flows/context/flow.current'
import {VersionPublishProvider} from 'src/flows/context/version.publish'

// Components
import ReadOnlyPipeList from 'src/flows/components/ReadOnlyPipeList'
import {VersionSidebar} from 'src/flows/components/VersionSidebar'
import VersionHeader from 'src/flows/components/header/VersionHeader'
import NotFound from 'src/shared/components/NotFound'

import 'src/flows/style.scss'
import 'src/flows/shared/Resizer.scss'
import '@influxdata/clockface/dist/index.css'

const ReadOnly: FC = ({children}) => {
  const {flow} = useContext(FlowContext)
  const {id} = useParams<{id: string}>()
  if (!id || !flow) {
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
    <Page titleTag={`${flow.name} | InfluxDB Cloud`}>
      <VersionHeader />
      <Page.Contents fullWidth={true} scrollable={false} className="flow-page">
        <PopupProvider>
          <DapperScrollbars
            noScrollX
            thumbStartColor="gray"
            thumbStopColor="gray"
          >
            <ReadOnlyPipeList />
          </DapperScrollbars>
          <VersionSidebar />
          <PopupDrawer />
        </PopupProvider>
      </Page.Contents>
    </Page>
  )
}

const FlowContainer: FC = () => (
  <VersionFlowProvider>
    <ReadOnly>
      <QueryProvider>
        <ResultsProvider>
          <FlowQueryProvider>
            <VersionPublishProvider>
              <ReadOnlyFlowPage />
            </VersionPublishProvider>
          </FlowQueryProvider>
        </ResultsProvider>
      </QueryProvider>
    </ReadOnly>
  </VersionFlowProvider>
)

export default FlowContainer
