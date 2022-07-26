import React, {FC, useContext, useCallback} from 'react'
import {RemoteDataState} from 'src/types'

// Components
import {
  DraggableResizer,
  Orientation,
  Button,
  IconFont,
} from '@influxdata/clockface'
import {QueryProvider, QueryContext} from 'src/shared/contexts/query'
import {EditorProvider} from 'src/shared/contexts/editor'
import {
  ResultsProvider,
  ResultsContext,
} from 'src/dataExplorer/components/ResultsContext'
import {SidebarProvider} from 'src/dataExplorer/context/sidebar'
import {
  PersistanceProvider,
  PersistanceContext,
} from 'src/dataExplorer/context/persistance'
import ResultsPane from 'src/dataExplorer/components/ResultsPane'
import Sidebar from 'src/dataExplorer/components/Sidebar'
import Schema from 'src/dataExplorer/components/Schema'

// Styles
import './FluxQueryBuilder.scss'

const FluxQueryBuilder: FC = () => {
  const {vertical, setVertical, setQuery, setSelection} = useContext(
    PersistanceContext
  )
  const {cancel} = useContext(QueryContext)
  const {setStatus, setResult} = useContext(ResultsContext)

  const clear = useCallback(() => {
    cancel()
    setStatus(RemoteDataState.NotStarted)
    setResult(null)
    setQuery('')
    setSelection({bucket: null, measurement: ''})
  }, [setQuery, setStatus, setResult, setSelection, cancel])

  return (
    <EditorProvider>
      <SidebarProvider>
        <div className="flux-query-builder--menu">
          <Button onClick={clear} text="New Script" icon={IconFont.Plus_New} />
        </div>
        <DraggableResizer
          handleOrientation={Orientation.Vertical}
          handlePositions={vertical}
          onChangePositions={setVertical}
        >
          <DraggableResizer.Panel>
            <Schema />
          </DraggableResizer.Panel>
          <DraggableResizer.Panel
            testID="flux-query-builder-middle-panel"
            className="new-data-explorer-rightside"
          >
            <ResultsPane />
          </DraggableResizer.Panel>
          <DraggableResizer.Panel>
            <Sidebar />
          </DraggableResizer.Panel>
        </DraggableResizer>
      </SidebarProvider>
    </EditorProvider>
  )
}

export default () => (
  <QueryProvider>
    <ResultsProvider>
      <PersistanceProvider>
        <FluxQueryBuilder />
      </PersistanceProvider>
    </ResultsProvider>
  </QueryProvider>
)
