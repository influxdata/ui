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
import {ResultsPane} from 'src/dataExplorer/components/ResultsPane'
import {Sidebar} from 'src/dataExplorer/components/Sidebar'
import {Schema} from 'src/dataExplorer/components/Schema'
import SaveAsScript from 'src/dataExplorer/components/SaveAsScript'

// Contexts
import {QueryProvider} from 'src/shared/contexts/query'
import {EditorProvider} from 'src/shared/contexts/editor'
import {ResultsProvider, ResultsContext} from 'src/dataExplorer/context/results'
import {ChildResultsProvider} from 'src/dataExplorer/context/results/childResults'
import {
  ResultsViewProvider,
  ResultsViewContext,
} from 'src/dataExplorer/context/resultsView'
import {SidebarProvider} from 'src/dataExplorer/context/sidebar'
import {
  PersistenceProvider,
  PersistenceContext,
} from 'src/dataExplorer/context/persistence'
import {QueryContext} from 'src/shared/contexts/query'
import {DBRPContext, DBRPProvider} from 'src/shared/contexts/dbrps'

// Utils
import {getOrg, isOrgIOx} from 'src/organizations/selectors'
import {SCRIPT_EDITOR_PARAMS} from 'src/dataExplorer/components/resources'
import {selectIsNewIOxOrg} from 'src/shared/selectors/app'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {CLOUD} from 'src/shared/constants'

// Types
import {RemoteDataState} from 'src/types'
import {QueryScope} from 'src/shared/contexts/query'
import {LanguageType} from 'src/dataExplorer/components/resources'

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
    useContext(PersistenceContext)
  const [overlayType, setOverlayType] = useState<OverlayType | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState(
    resource?.language ?? LanguageType.FLUX
  )
  const isIoxOrg = useSelector(isOrgIOx)
  const {cancel} = useContext(QueryContext)
  const {setStatus, setResult} = useContext(ResultsContext)
  const {clear: clearViewOptions} = useContext(ResultsViewContext)
  const {hasDBRPs} = useContext(DBRPContext)
  const org = useSelector(getOrg)
  const isNewIOxOrg =
    useSelector(selectIsNewIOxOrg) &&
    !isFlagEnabled('showOldDataExplorerInNewIOx') &&
    !isFlagEnabled('enableFluxInScriptBuilder')

  const handleClear = useCallback(() => {
    cancel()
    setStatus(RemoteDataState.NotStarted)
    setResult(null)
    clearViewOptions()

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
    if (CLOUD) {
      setOverlayType(OverlayType.NEW)
    }
  }

  const handleNewScript = useCallback(() => {
    if (hasChanged && CLOUD) {
      setOverlayType(OverlayType.NEW)
    } else {
      handleClear()
    }
  }, [handleClear, hasChanged])

  const filterOutFluxInIOx = option =>
    isNewIOxOrg ? option !== LanguageType.FLUX : true

  const menuIOx = (onCollapse: () => void) => (
    <Dropdown.Menu onCollapse={onCollapse}>
      {[LanguageType.FLUX, LanguageType.SQL]
        .filter(filterOutFluxInIOx)
        .map(option => (
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
      {isFlagEnabled('influxqlUI') && hasDBRPs() ? (
        <Dropdown.Item
          className={`script-dropdown__${LanguageType.INFLUXQL}`}
          key={LanguageType.INFLUXQL}
          onClick={() => handleSelectDropdown(LanguageType.INFLUXQL)}
          selected={resource?.language === LanguageType.INFLUXQL}
          testID={`script-dropdown__${LanguageType.INFLUXQL}`}
        >
          InfluxQL
        </Dropdown.Item>
      ) : null}
    </Dropdown.Menu>
  )

  const menuTSM = (onCollapse: () => void) => (
    <Dropdown.Menu onCollapse={onCollapse}>
      {[LanguageType.FLUX].map(option => (
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
      {isFlagEnabled('influxqlUI') && hasDBRPs() ? (
        <Dropdown.Item
          className={`script-dropdown__${LanguageType.INFLUXQL}`}
          key={LanguageType.INFLUXQL}
          onClick={() => handleSelectDropdown(LanguageType.INFLUXQL)}
          selected={resource?.language === LanguageType.INFLUXQL}
          testID={`script-dropdown__${LanguageType.INFLUXQL}`}
        >
          InfluxQL
        </Dropdown.Item>
      ) : null}
    </Dropdown.Menu>
  )

  const button = (active: boolean, onClick) => (
    <Dropdown.Button
      active={active}
      onClick={onClick}
      testID="script-query-builder--new-script"
    >
      <>
        <Icon glyph={IconFont.Plus_New} />
        &nbsp;New Script
      </>
    </Dropdown.Button>
  )

  const tsmNewScriptDropDown =
    isFlagEnabled('influxqlUI') && hasDBRPs() ? (
      <Dropdown
        menu={menuTSM}
        button={button}
        testID="select-option-dropdown"
      />
    ) : (
      <Button
        onClick={handleNewScript}
        text="New Script"
        icon={IconFont.Plus_New}
        testID="script-query-builder--new-script"
      />
    )

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
                    menu={menuIOx}
                    button={button}
                    testID="select-option-dropdown"
                  />
                ) : (
                  tsmNewScriptDropDown
                )}
                {CLOUD && (
                  <>
                    <Button
                      className="script-query-builder__action-button"
                      onClick={() => setOverlayType(OverlayType.OPEN)}
                      text="Open"
                      icon={IconFont.FolderOpen}
                      testID="script-query-builder--open-script"
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
                        testID="script-query-builder--edit-script"
                      />
                    )}
                  </>
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

export default () => {
  const org = useSelector(getOrg)
  const scope = {
    org: org.id,
    region: window.location.origin,
  } as QueryScope

  return (
    <QueryProvider>
      <ResultsProvider>
        <ResultsViewProvider>
          <DBRPProvider scope={scope}>
            <PersistenceProvider>
              <ChildResultsProvider>
                <ScriptQueryBuilder />
              </ChildResultsProvider>
            </PersistenceProvider>
          </DBRPProvider>
        </ResultsViewProvider>
      </ResultsProvider>
    </QueryProvider>
  )
}
