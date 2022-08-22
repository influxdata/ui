import React, {FC, useContext, useCallback} from 'react'
import {RemoteDataState} from 'src/types'
import {useHistory, useLocation} from 'react-router-dom'

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
  ComponentColor,
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
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

const FluxQueryBuilder: FC = () => {
  const {vertical, setVertical, setQuery, setSelection} = useContext(
    PersistanceContext
  )
  const history = useHistory()
  const {pathname} = useLocation()
  const {cancel} = useContext(QueryContext)
  const {setStatus, setResult} = useContext(ResultsContext)

  const clear = useCallback(() => {
    cancel()
    setStatus(RemoteDataState.NotStarted)
    setResult(null)
    setQuery('')
    setSelection({bucket: null, measurement: ''})
  }, [setQuery, setStatus, setResult, setSelection, cancel])

  const handleShowOverlay = () => {
    history.push(`${pathname}/save`)
  }

  return (
    <EditorProvider>
      <SidebarProvider>
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
              onClick={clear}
              text="New Script"
              icon={IconFont.Plus_New}
            />
            {isFlagEnabled('saveLoadFeature') && (
              <Button
                className="flux-query-builder__save-button"
                icon={IconFont.Save}
                onClick={handleShowOverlay}
                color={ComponentColor.Default}
                titleText="Save your query as a Script, Cell, Notebook or Task"
                text="Save"
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
