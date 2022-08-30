import React, {FC, useState, useContext} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

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
import {QueryProvider} from 'src/shared/contexts/query'
import {EditorProvider} from 'src/shared/contexts/editor'
import {ResultsProvider} from 'src/dataExplorer/components/ResultsContext'
import {SidebarProvider} from 'src/dataExplorer/context/sidebar'
import {
  PersistanceProvider,
  PersistanceContext,
} from 'src/dataExplorer/context/persistance'
import ResultsPane from 'src/dataExplorer/components/ResultsPane'
import Sidebar from 'src/dataExplorer/components/Sidebar'
import Schema from 'src/dataExplorer/components/Schema'
import SaveAsScript from 'src/dataExplorer/components/SaveAsScript'
import {QueryContext} from 'src/shared/contexts/query'
import {ResultsContext} from 'src/dataExplorer/components/ResultsContext'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {getOrg} from 'src/organizations/selectors'
import {RemoteDataState} from 'src/types'

// Styles
import './FluxQueryBuilder.scss'

export enum OverlayType {
  NEW = 'new',
  OPEN = 'open',
  SAVE = 'save',
}

const FluxQueryBuilder: FC = () => {
  const {hasChanged, query, vertical, setVertical} = useContext(
    PersistanceContext
  )
  const history = useHistory()
  const [overlayType, setOverlayType] = useState<OverlayType | null>(null)
  const {cancel} = useContext(QueryContext)
  const {setStatus, setResult} = useContext(ResultsContext)
  const org = useSelector(getOrg)

  const handleNewScript = () => {
    if (hasChanged) {
      setOverlayType(OverlayType.NEW)
    } else {
      cancel()
      setStatus(RemoteDataState.NotStarted)
      setResult(null)

      history.replace(`/orgs/${org.id}/data-explorer/from/script`)
    }
  }

  return (
    <EditorProvider>
      <SidebarProvider>
        <Overlay visible={overlayType !== null}>
          <SaveAsScript
            type={overlayType}
            onClose={() => setOverlayType(null)}
          />
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
              onClick={handleNewScript}
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
                className="flux-query-builder__action-button"
                onClick={() => setOverlayType(OverlayType.OPEN)}
                text="Open"
                icon={IconFont.Export_New}
              />
            )}
            {isFlagEnabled('saveAsScript') && (
              <Button
                className="flux-query-builder__action-button"
                onClick={() => setOverlayType(OverlayType.SAVE)}
                status={
                  hasChanged
                    ? ComponentStatus.Default
                    : ComponentStatus.Disabled
                }
                text="Save"
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
