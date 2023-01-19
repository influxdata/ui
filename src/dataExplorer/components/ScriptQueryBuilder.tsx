import React, {FC, useCallback, useState, useContext} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {
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
import {ResultsProvider, ResultsContext} from 'src/dataExplorer/context/results'
import {ChildResultsProvider} from 'src/dataExplorer/context/results/childResults'
import {ResultsViewProvider} from 'src/dataExplorer/context/resultsView'
import {SidebarProvider} from 'src/dataExplorer/context/sidebar'
import {
  PersistanceProvider,
  PersistanceContext,
} from 'src/dataExplorer/context/persistance'
import {LanguageType} from 'src/dataExplorer/components/resources'
import {ResultsPane} from 'src/dataExplorer/components/ResultsPane'
import Sidebar from 'src/dataExplorer/components/Sidebar'
import Schema from 'src/dataExplorer/components/Schema'
import SaveAsScript from 'src/dataExplorer/components/SaveAsScript'
import {QueryContext} from 'src/shared/contexts/query'
import {getOrg, isOrgIOx} from 'src/organizations/selectors'
import {RemoteDataState} from 'src/types'
import {SCRIPT_EDITOR_PARAMS} from 'src/dataExplorer/components/resources'

// Styles
import './ScriptQueryBuilder.scss'

export enum OverlayType {
  DELETE = 'delete',
  EDIT = 'edit',
  NEW = 'new',
  OPEN = 'open',
  SAVE = 'save',
}

const ScriptQueryBuilder: FC = () => {
  const history = useHistory()
  const {resource, hasChanged, vertical, setVertical, setHasChanged} =
    useContext(PersistanceContext)
  const [overlayType, setOverlayType] = useState<OverlayType | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState(
    resource?.language ?? LanguageType.FLUX
  )
  const isIoxOrg = useSelector(isOrgIOx)
  const {cancel} = useContext(QueryContext)
  const {setStatus, setResult} = useContext(ResultsContext)
  const org = useSelector(getOrg)

  const handleClear = useCallback(() => {
    cancel()
    setStatus(RemoteDataState.NotStarted)
    setResult(null)

    if (isIoxOrg) {
      history.replace(
        `/orgs/${org.id}/data-explorer/from/script?language=${selectedLanguage}&${SCRIPT_EDITOR_PARAMS}`
      )
    } else {
      history.replace(
        `/orgs/${org.id}/data-explorer/from/script${SCRIPT_EDITOR_PARAMS}`
      )
    }
  }, [
    cancel,
    isIoxOrg,
    org.id,
    history,
    setResult,
    setStatus,
    selectedLanguage,
  ])

  const handleSelectDropdown = (language: LanguageType) => {
    // set the language in the state until we can confirm the selection
    setSelectedLanguage(language)
    setHasChanged(true)
    setOverlayType(OverlayType.NEW)
  }

  const handleNewScript = useCallback(() => {
    if (hasChanged) {
      setOverlayType(OverlayType.NEW)
    } else {
      handleClear()
    }
  }, [handleClear, hasChanged])

  return (
    <EditorProvider>
      <SidebarProvider>
        <Overlay visible={overlayType !== null}>
          <SaveAsScript
            language={selectedLanguage}
            type={overlayType}
            setOverlayType={setOverlayType}
            onClose={() => setOverlayType(null)}
          />
        </Overlay>
        <FlexBox
          className="script-query-builder--container"
          direction={FlexDirection.Column}
          justifyContent={JustifyContent.SpaceBetween}
          alignItems={AlignItems.Stretch}
        >
          <div
            className="script-query-builder--menu"
            data-testid="script-query-builder--menu"
          >
            <FlexBox
              direction={FlexDirection.Row}
              justifyContent={JustifyContent.SpaceBetween}
            >
              <div style={{display: 'flex'}}>
                {isIoxOrg ? (
                  <Dropdown
                    menu={onCollapse => (
                      <Dropdown.Menu onCollapse={onCollapse}>
                        {[LanguageType.FLUX, LanguageType.SQL].map(option => (
                          <Dropdown.Item
                            className={`script-dropdown__${option}`}
                            key={option}
                            onClick={() => handleSelectDropdown(option)}
                            selected={resource?.language === option}
                            testID={`script-dropdown__${option}`}
                          >
                            {option}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    )}
                    button={(active, onClick) => (
                      <Dropdown.Button
                        active={active}
                        onClick={onClick}
                        testID="query-builder--new-script"
                      >
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
                    text="New Script"
                    icon={IconFont.Plus_New}
                    testID="script-query-builder--new-script"
                  />
                )}
                <Button
                  className="script-query-builder__action-button"
                  onClick={() => setOverlayType(OverlayType.OPEN)}
                  text="Open"
                  icon={IconFont.FolderOpen}
                />
                <Button
                  className="script-query-builder__action-button"
                  onClick={() => setOverlayType(OverlayType.SAVE)}
                  status={
                    hasChanged
                      ? ComponentStatus.Default
                      : ComponentStatus.Disabled
                  }
                  text="Save"
                  testID="script-query-builder--save-script"
                  icon={IconFont.Save}
                />
                {resource?.data?.id && (
                  <Button
                    className="script-query-builder__action-button"
                    onClick={() => setOverlayType(OverlayType.EDIT)}
                    status={ComponentStatus.Default}
                    text="Edit"
                    icon={IconFont.Pencil}
                  />
                )}
              </div>
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
              testID="script-query-builder-middle-panel"
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
      <ResultsViewProvider>
        <PersistanceProvider>
          <ChildResultsProvider>
            <ScriptQueryBuilder />
          </ChildResultsProvider>
        </PersistanceProvider>
      </ResultsViewProvider>
    </ResultsProvider>
  </QueryProvider>
)
