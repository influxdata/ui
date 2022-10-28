import React, {FC, useCallback, useState, useContext} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {
  ComponentColor,
  DraggableResizer,
  Dropdown,
  FlexBox,
  FlexDirection,
  Orientation,
  Button,
  Icon,
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
import {LanguageType} from 'src/dataExplorer/components/resources'
import ResultsPane from 'src/dataExplorer/components/ResultsPane'
import Sidebar from 'src/dataExplorer/components/Sidebar'
import Schema from 'src/dataExplorer/components/Schema'
import SaveAsScript from 'src/dataExplorer/components/SaveAsScript'
import {QueryContext} from 'src/shared/contexts/query'
import {ResultsContext} from 'src/dataExplorer/components/ResultsContext'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {getOrg, isOrgIOx} from 'src/organizations/selectors'
import {RemoteDataState} from 'src/types'
import {SCRIPT_EDITOR_PARAMS} from 'src/dataExplorer/components/resources'

// Styles
import './FluxQueryBuilder.scss'

export enum OverlayType {
  DELETE = 'delete',
  EDIT = 'edit',
  NEW = 'new',
  OPEN = 'open',
  SAVE = 'save',
}

const FluxQueryBuilder: FC = () => {
  const history = useHistory()
  const {resource, hasChanged, vertical, setVertical, setHasChanged} =
    useContext(PersistanceContext)
  const [overlayType, setOverlayType] = useState<OverlayType | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState(
    resource?.language ?? LanguageType.FLUX
  )
  const isIoxOrg = useSelector(isOrgIOx)
  const [isOverlayVisible, setIsOverlayVisible] = useState(false)
  const {cancel} = useContext(QueryContext)
  const {setStatus, setResult} = useContext(ResultsContext)
  const org = useSelector(getOrg)

  const handleClear = useCallback(() => {
    cancel()
    setStatus(RemoteDataState.NotStarted)
    setResult(null)

    if (isFlagEnabled('uiSqlSupport') && isIoxOrg) {
      history.replace(
        `/orgs/${org.id}/data-explorer/from/script?language=${selectedLanguage}&${SCRIPT_EDITOR_PARAMS}`
      )
    } else {
      history.replace(
        `/orgs/${org.id}/data-explorer/from/script${SCRIPT_EDITOR_PARAMS}`
      )
    }

    if (!isFlagEnabled('saveAsScript')) {
      setIsOverlayVisible(false)
    }
  }, [cancel, org.id, history, setResult, setStatus, selectedLanguage])

  const handleSelectDropdown = (language: LanguageType) => {
    // set the language in the state until we can confirm the selection
    setSelectedLanguage(language)
    setHasChanged(true)
    setOverlayType(OverlayType.NEW)
  }

  const handleNewScript = useCallback(() => {
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
  }, [handleClear, hasChanged])

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
              language={selectedLanguage}
              type={overlayType}
              setOverlayType={setOverlayType}
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
              <div style={{display: 'flex'}}>
                {isFlagEnabled('uiSqlSupport') && isIoxOrg ? (
                  <Dropdown
                    menu={onCollapse => (
                      <Dropdown.Menu onCollapse={onCollapse}>
                        {[LanguageType.FLUX, LanguageType.SQL].map(option => (
                          <Dropdown.Item
                            className={`script-dropdown__${option}`}
                            key={option}
                            onClick={() => handleSelectDropdown(option)}
                            selected={resource?.language === option}
                          >
                            {option}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    )}
                    button={(active, onClick) => (
                      <Dropdown.Button active={active} onClick={onClick}>
                        <>
                          <Icon glyph={IconFont.Plus_New} />
                          &nbsp;New Script
                        </>
                      </Dropdown.Button>
                    )}
                    testID="select-option-dropdown"
                  />
                ) : (
                  <Button
                    onClick={handleNewScript}
                    text={
                      isFlagEnabled('saveAsScript') ? 'New Script' : 'Clear'
                    }
                    icon={IconFont.Plus_New}
                    testID="flux-query-builder--new-script"
                  />
                )}
                {isFlagEnabled('saveAsScript') && (
                  <Button
                    className="flux-query-builder__action-button"
                    onClick={() => setOverlayType(OverlayType.OPEN)}
                    text="Open"
                    icon={IconFont.FolderOpen}
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
                    testID="flux-query-builder--save-script"
                    icon={IconFont.SaveOutline}
                  />
                )}
                {isFlagEnabled('saveAsScript') && resource?.data?.id && (
                  <Button
                    className="flux-query-builder__action-button"
                    onClick={() => setOverlayType(OverlayType.EDIT)}
                    status={ComponentStatus.Default}
                    text="Edit"
                    icon={IconFont.Pencil}
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
              {isFlagEnabled('uiSqlSupport') &&
              resource?.language === LanguageType.SQL ? null : (
                <Sidebar />
              )}
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
