// Libraries
import React, {FC, useContext, useEffect} from 'react'
import {Switch, Route, Link} from 'react-router-dom'

// Components
import DataExplorer from 'src/dataExplorer/components/DataExplorer'
import FluxQueryBuilder from 'src/dataExplorer/components/FluxQueryBuilder'
import {
  Page,
  Icon,
  IconFont,
  FlexBox,
  ComponentSize,
  InputLabel,
  SlideToggle,
} from '@influxdata/clockface'
import SaveAsButton from 'src/dataExplorer/components/SaveAsButton'
import VisOptionsButton from 'src/timeMachine/components/VisOptionsButton'
import GetResources from 'src/resources/components/GetResources'
import TimeZoneDropdown from 'src/shared/components/TimeZoneDropdown'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'
import SaveAsOverlay from 'src/dataExplorer/components/SaveAsOverlay'
import ViewTypeDropdown from 'src/timeMachine/components/ViewTypeDropdown'
import {AddAnnotationDEOverlay} from 'src/overlays/components/index'
import {EditAnnotationDEOverlay} from 'src/overlays/components/index'
import TemplatePage from 'src/dataExplorer/components/resources/TemplatePage'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {event, useLoadTimeReporting} from 'src/cloud/utils/reporting'
import {FeatureFlag} from 'src/shared/utils/featureFlag'

// Types
import {ResourceType} from 'src/types'

import 'src/shared/components/cta.scss'
import {AppSettingContext} from 'src/shared/contexts/app'
import {
  PersistanceContext,
  PersistanceProvider,
} from 'src/dataExplorer/context/persistance'
import {PROJECT_NAME, PROJECT_NAME_PLURAL} from 'src/flows'

const DataExplorerPageHeader: FC = () => {
  const {fluxQueryBuilder, setFluxQueryBuilder} = useContext(AppSettingContext)
  const {resource} = useContext(PersistanceContext)

  const toggleSlider = () => {
    event('toggled new query builder', {active: `${!fluxQueryBuilder}`})
    setFluxQueryBuilder(!fluxQueryBuilder)
  }

  let pageTitle = 'Data Explorer'

  if (fluxQueryBuilder && resource?.data?.hasOwnProperty('name')) {
    pageTitle = resource?.data?.name ?? ''
  }

  return (
    <Page.Header
      fullWidth={true}
      className={`${
        fluxQueryBuilder ? 'flux-query-builder' : 'data-explorer'
      }--header`}
      testID="data-explorer--header"
    >
      <Page.Title title={pageTitle} />
      <FlexBox margin={ComponentSize.Large}>
        <FeatureFlag name="newDataExplorer">
          <FlexBox margin={ComponentSize.Medium}>
            <InputLabel>&#10024; Try new Data Explorer</InputLabel>
            <SlideToggle
              active={fluxQueryBuilder}
              onChange={toggleSlider}
              testID="flux-query-builder-toggle"
            />
          </FlexBox>
        </FeatureFlag>
        <RateLimitAlert location="data explorer" />
      </FlexBox>
    </Page.Header>
  )
}

const DataExplorerPage: FC = () => {
  const {flowsCTA, fluxQueryBuilder, setFlowsCTA} = useContext(
    AppSettingContext
  )
  useLoadTimeReporting('DataExplorerPage load start')

  const hideFlowsCTA = () => {
    setFlowsCTA({explorer: false})
  }

  const recordClick = () => {
    event('Data Explorer Page - Clicked Notebooks CTA')
  }

  useEffect(() => {
    return () => {
      event('Exited Data Explorer')
    }
  }, [])

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
        {!fluxQueryBuilder && (
          <Page.ControlBar fullWidth={true}>
            <Page.ControlBarLeft>
              <ViewTypeDropdown />
              <VisOptionsButton />
            </Page.ControlBarLeft>
            <Page.ControlBarRight>
              <TimeZoneDropdown />
              <SaveAsButton />
            </Page.ControlBarRight>
          </Page.ControlBar>
        )}
        <Page.Contents fullWidth={true} scrollable={false}>
          {!fluxQueryBuilder && <DataExplorer />}
          {fluxQueryBuilder && <FluxQueryBuilder />}
        </Page.Contents>
      </GetResources>
    </Page>
  )
}

export default DataExplorerPage
