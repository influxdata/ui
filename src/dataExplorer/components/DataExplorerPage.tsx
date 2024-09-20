// Libraries
import React, {FC, useContext, useEffect} from 'react'
import {Switch, Route, Link, useHistory} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'

// Components
import DataExplorer from 'src/dataExplorer/components/DataExplorer'
import ScriptQueryBuilder from 'src/dataExplorer/components/ScriptQueryBuilder'
import {
  Page,
  Icon,
  IconFont,
  FlexBox,
  ComponentSize,
  InputLabel,
  SlideToggle,
} from '@influxdata/clockface'
import {SaveAsButton} from 'src/dataExplorer/components/SaveAsButton'
import VisOptionsButton from 'src/timeMachine/components/VisOptionsButton'
import GetResources from 'src/resources/components/GetResources'
import TimeZoneDropdown from 'src/shared/components/TimeZoneDropdown'
import {SaveAsOverlay} from 'src/dataExplorer/components/SaveAsOverlay'
import ViewTypeDropdown from 'src/timeMachine/components/ViewTypeDropdown'
import {AddAnnotationDEOverlay} from 'src/overlays/components/index'
import {EditAnnotationDEOverlay} from 'src/overlays/components/index'
import TemplatePage from 'src/dataExplorer/components/resources/TemplatePage'
import RenamablePageTitle from 'src/pageLayout/components/RenamablePageTitle'

// Selectors
import {selectIsNewIOxOrg} from 'src/shared/selectors/app'
import {selectShouldShowNotebooks} from 'src/flows/selectors/flowsSelectors'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {event, useLoadTimeReporting} from 'src/cloud/utils/reporting'
import {FeatureFlag, isFlagEnabled} from 'src/shared/utils/featureFlag'
import {notify} from 'src/shared/actions/notifications'
import {scriptSaveFail} from 'src/shared/copy/notifications'

// Types
import {ResourceType} from 'src/types'

import 'src/shared/components/cta.scss'
import {AppSettingContext} from 'src/shared/contexts/app'
import {
  PersistanceContext,
  PersistanceProvider,
} from 'src/dataExplorer/context/persistance'
import {PROJECT_NAME, PROJECT_NAME_PLURAL} from 'src/flows'
import {SCRIPT_EDITOR_PARAMS} from 'src/dataExplorer/components/resources'
import {CLOUD} from 'src/shared/constants'

const DataExplorerPageHeader: FC = () => {
  const {scriptQueryBuilder, setScriptQueryBuilder} =
    useContext(AppSettingContext)
  const {resource, save} = useContext(PersistanceContext)
  const isNewIOxOrg = useSelector(selectIsNewIOxOrg)
  const shouldShowDataExplorerToggle =
    (!isNewIOxOrg || isFlagEnabled('showOldDataExplorerInNewIOx')) && CLOUD

  const history = useHistory()
  const dispatch = useDispatch()

  const toggleSlider = () => {
    event('toggled new query builder', {active: `${!scriptQueryBuilder}`})
    if (!scriptQueryBuilder) {
      history.push({
        search: SCRIPT_EDITOR_PARAMS,
      })
    } else {
      history.push({search: null})
    }
    setScriptQueryBuilder(!scriptQueryBuilder)
  }

  const handleRename = (name: string) => {
    resource.data.name = name
    save(resource?.language).catch(error => {
      dispatch(
        notify(
          scriptSaveFail(resource?.data?.name ?? '', error?.message ?? error)
        )
      )
    })
  }

  let pageTitle = <Page.Title title="Data Explorer" />

  if (scriptQueryBuilder && resource?.data?.hasOwnProperty('name')) {
    pageTitle = (
      <RenamablePageTitle
        onRename={handleRename}
        name={resource?.data?.name || ''}
        placeholder="Untitled Script"
        maxLength={100}
      />
    )
  }

  return (
    <Page.Header
      fullWidth={true}
      className={`${
        scriptQueryBuilder ? 'script-query-builder' : 'data-explorer'
      }--header`}
      testID="data-explorer--header"
    >
      {pageTitle}
      <FlexBox margin={ComponentSize.Large}>
        {shouldShowDataExplorerToggle && (
          <FlexBox margin={ComponentSize.Medium}>
            <InputLabel>Switch to old Data Explorer</InputLabel>
            <SlideToggle
              active={!scriptQueryBuilder}
              onChange={toggleSlider}
              testID="script-query-builder-toggle"
            />
          </FlexBox>
        )}
      </FlexBox>
    </Page.Header>
  )
}

const DataExplorerPage: FC = () => {
  const {flowsCTA, scriptQueryBuilder, setFlowsCTA} =
    useContext(AppSettingContext)
  useLoadTimeReporting('DataExplorerPage load start')
  const history = useHistory()
  const isNewIOxOrg =
    useSelector(selectIsNewIOxOrg) &&
    !isFlagEnabled('showOldDataExplorerInNewIOx')
  const shouldShowNotebooks = useSelector(selectShouldShowNotebooks)
  const shouldShowNewExplorer = (scriptQueryBuilder || isNewIOxOrg) && CLOUD

  const shouldShowSaveAsButton =
    !useSelector(selectIsNewIOxOrg) ||
    shouldShowNotebooks ||
    isFlagEnabled('showTasksInNewIOx') ||
    isFlagEnabled('showDashboardsInNewIOx') ||
    isFlagEnabled('showVariablesInNewIOx')

  const hideFlowsCTA = () => {
    setFlowsCTA({explorer: false})
  }

  const recordClick = () => {
    event('Data Explorer Page - Clicked Notebooks CTA')
  }

  useEffect(() => {
    if (scriptQueryBuilder) {
      history.push({
        search: SCRIPT_EDITOR_PARAMS,
      })
    } else {
      history.push({
        search: null,
      })
    }
    return () => {
      event('Exited Data Explorer')
    }
  }, [scriptQueryBuilder, history])

  return (
    <Page titleTag={pageTitleSuffixer(['Data Explorer'])}>
      <Switch>
        <Route
          path="/orgs/:orgID/data-explorer/from"
          component={TemplatePage}
        />
        <Route
          path="/orgs/:orgID/data-explorer/save"
          component={SaveAsOverlay}
        />
        <Route
          path="/orgs/:orgID/data-explorer/add-annotation"
          component={AddAnnotationDEOverlay}
        />
        <Route
          path="/orgs/:orgID/data-explorer/edit-annotation"
          component={EditAnnotationDEOverlay}
        />
      </Switch>
      <GetResources resources={[ResourceType.Variables]}>
        <PersistanceProvider>
          <DataExplorerPageHeader />
        </PersistanceProvider>
        {flowsCTA.explorer && (
          <FeatureFlag name="flowsCTA">
            <div className="header-cta--de">
              <div className="header-cta">
                <Icon glyph={IconFont.Pencil} />
                Now you can use {PROJECT_NAME_PLURAL} to explore and take action
                on your data
                <Link
                  to={`/${PROJECT_NAME.toLowerCase()}/from/default`}
                  onClick={recordClick}
                >
                  Create a {PROJECT_NAME}
                </Link>
                <span className="header-cta--close-icon" onClick={hideFlowsCTA}>
                  <Icon glyph={IconFont.Remove_New} />
                </span>
              </div>
            </div>
          </FeatureFlag>
        )}
        {!shouldShowNewExplorer && (
          <Page.ControlBar fullWidth={true}>
            <Page.ControlBarLeft>
              <ViewTypeDropdown />
              <VisOptionsButton />
            </Page.ControlBarLeft>
            <Page.ControlBarRight>
              <TimeZoneDropdown />
              {shouldShowSaveAsButton && <SaveAsButton />}
            </Page.ControlBarRight>
          </Page.ControlBar>
        )}
        <Page.Contents
          fullWidth={true}
          scrollable={false}
          testID="data-explorer-page"
        >
          {!shouldShowNewExplorer && <DataExplorer />}
          {shouldShowNewExplorer && <ScriptQueryBuilder />}
        </Page.Contents>
      </GetResources>
    </Page>
  )
}

export default DataExplorerPage
