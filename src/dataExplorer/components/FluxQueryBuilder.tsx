import React, {FC, useState, useContext} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {
  ComponentColor,
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
  const history = useHistory()
  const {hasChanged, query, vertical, setVertical} =
    useContext(PersistanceContext)
  const [overlayType, setOverlayType] = useState<OverlayType | null>(null)
  const [isOverlayVisible, setIsOverlayVisible] = useState(false)
  const {cancel} = useContext(QueryContext)
  const {setStatus, setResult} = useContext(ResultsContext)
  const org = useSelector(getOrg)

  const handleClear = () => {
    cancel()
    setStatus(RemoteDataState.NotStarted)
    setResult(null)

    history.replace(`/orgs/${org.id}/data-explorer/from/script`)

    if (!isFlagEnabled('saveAsScript')) {
      setIsOverlayVisible(false)
    }
  }

  const handleNewScript = () => {
    if (isFlagEnabled('saveAsScript')) {
      if (hasChanged) {
        setOverlayType(OverlayType.NEW)
      } else {
        handleClear()
      }
    } else {
      if (hasChanged) {
        setIsOverlayVisible(true)
      } else {
        handleClear()
      }
    }
  }

  const handleUserpilot = () => {
    if (window.userpilot) {
      window.userpilot.trigger('1663269889fDfn2554')
    }
  }

  return (
    <EditorProvider>
      <SidebarProvider>
        {isFlagEnabled('saveAsScript') ? (
          <Overlay visible={overlayType !== null}>
            <SaveAsScript
              type={overlayType}
              onClose={() => setOverlayType(null)}
            />
          </Overlay>
        ) : (
          <Overlay visible={isOverlayVisible}>
            <Overlay.Container maxWidth={500}>
              <Overlay.Header title="Caution" />
              <Overlay.Body>
                This operation will wipe out your existing query text. Are you
                sure you want to continue clearing your existing query?
              </Overlay.Body>
              <Overlay.Footer>
                <Button
                  color={ComponentColor.Default}
                  onClick={() => setIsOverlayVisible(false)}
                  text="No"
                />
                <Button
                  color={ComponentColor.Primary}
                  onClick={handleClear}
                  text="Yes"
                />
              </Overlay.Footer>
            </Overlay.Container>
          </Overlay>
        )}
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
            <FlexBox
              direction={FlexDirection.Row}
              justifyContent={JustifyContent.SpaceBetween}
            >
              <div>
                <Button
                  onClick={handleNewScript}
                  text={isFlagEnabled('saveAsScript') ? 'New Script' : 'Clear'}
                  icon={IconFont.Plus_New}
                  status={
                    query.length === 0
                      ? ComponentStatus.Disabled
                      : ComponentStatus.Default
                  }
                  testID="flux-query-builder--new-script"
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
              {isFlagEnabled('userFeedback') && (
                <button
                  className="userpilot-feedback"
                  onClick={handleUserpilot}
                >
                  Provide Feedback
                </button>
              )}
            </FlexBox>
          </div>
          <DraggableResizer
            className="draggable-resizer--collapsible"
            handleOrientation={Orientation.Vertical}
            handlePositions={vertical}
            onChangePositions={setVertical}
          >
            <DraggableResizer.Panel isCollapsible={true}>
              <Schema />
            </DraggableResizer.Panel>
            <DraggableResizer.Panel
              testID="flux-query-builder-middle-panel"
              className="new-data-explorer-rightside"
            >
              <ResultsPane />
            </DraggableResizer.Panel>
            <DraggableResizer.Panel isCollapsible={true}>
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
