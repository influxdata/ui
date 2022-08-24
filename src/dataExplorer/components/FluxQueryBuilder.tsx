import React, {FC, useState, useContext, useCallback} from 'react'

// Components
import {
  DraggableResizer,
  FlexBox,
  FlexDirection,
  Orientation,
  Button,
  IconFont,
  AlignItems,
  JustifyContent,
  Overlay,
  ComponentStatus,
} from '@influxdata/clockface'
import {QueryProvider, QueryContext} from 'src/shared/contexts/query'
import {EditorProvider} from 'src/shared/contexts/editor'
import {ResultsProvider, ResultsContext} from 'src/dataExplorer/components/ResultsContext'
import {SidebarProvider} from 'src/dataExplorer/context/sidebar'
import {
  DEFAULT_SCHEMA,
  PersistanceProvider,
  PersistanceContext,
} from 'src/dataExplorer/context/persistance'
import ResultsPane from 'src/dataExplorer/components/ResultsPane'
import Sidebar from 'src/dataExplorer/components/Sidebar'
import Schema from 'src/dataExplorer/components/Schema'
import SaveAsScript from 'src/dataExplorer/components/SaveAsScript'

// Styles
import './FluxQueryBuilder.scss'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {RemoteDataState} from 'src/types'

const FluxQueryBuilder: FC = () => {
  const {vertical, setVertical, query, setQuery, setSelection} = useContext(
    PersistanceContext
  )
  const {cancel} = useContext(QueryContext)
  const {setStatus, setResult} = useContext(ResultsContext)
  const {save} = useContext(PersistanceContext)
  const [isPromptVisible, setIsPromptVisible] = useState(false)

  const clear = useCallback(() => {
    cancel()
    setStatus(RemoteDataState.NotStarted)
    setResult(null)
    setQuery('')
    setSelection(JSON.parse(JSON.stringify(DEFAULT_SCHEMA)))
  }, [setQuery, setStatus, setResult, setSelection, cancel])

  // this is to keep tsc errors away until i put that clear somewhere
  if (false) {
    clear()
  }

  return (
    <EditorProvider>
      <SidebarProvider>
        <Overlay visible={isPromptVisible}>
          <SaveAsScript onClose={() => setIsPromptVisible(false)} />
        </Overlay>
        <FlexBox
          className="flux-query-builder--container"
          direction={FlexDirection.Column}
          justifyContent={JustifyContent.SpaceBetween}
          alignItems={AlignItems.Stretch}
        >
          <div
            className="flux-query-builder--menu"
            data-testid="flux-query-builder--menu"
          >
            <Button
              onClick={() => setIsPromptVisible(true)}
              text="New Script"
              icon={IconFont.Plus_New}
              status={
                query.length === 0
                  ? ComponentStatus.Disabled
                  : ComponentStatus.Default
              }
            />
            {isFlagEnabled('saveAsScript') && (
              <Button
                onClick={() => {
                  save()
                }}
                text="Save Script"
                icon={IconFont.Save}
              />
            )}
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
        </FlexBox>
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
