// Libraries
import React, {FC} from 'react'
import {Switch, Route} from 'react-router-dom'

// Components
import DataExplorer from 'src/dataExplorer/components/DataExplorer'
import {Page} from '@influxdata/clockface'
import SaveAsButton from 'src/dataExplorer/components/SaveAsButton'
import VisOptionsButton from 'src/timeMachine/components/VisOptionsButton'
import GetResources from 'src/resources/components/GetResources'
import TimeZoneDropdown from 'src/shared/components/TimeZoneDropdown'
import DeleteDataButton from 'src/dataExplorer/components/DeleteDataButton'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'
import SaveAsOverlay from 'src/dataExplorer/components/SaveAsOverlay'
import DEDeleteDataOverlay from 'src/dataExplorer/components/DeleteDataOverlay'
import ViewTypeDropdown from 'src/timeMachine/components/ViewTypeDropdown'
import {AnnotationsToggleButton} from 'src/annotations/components/AnnotationsToggleButton'
import {FeatureFlag} from 'src/shared/utils/featureFlag'
import {AnnotationsControlBar} from 'src/annotations/components/controlBar/AnnotationsControlBar'
import {AddAnnotationDEOverlay} from 'src/overlays/components/index'
import {EditAnnotationDEOverlay} from 'src/overlays/components/index'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {useLoadTimeReporting} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Types
import {ResourceType} from 'src/types'

const DataExplorerPage: FC = () => {
  useLoadTimeReporting('DataExplorerPage load start')

  return (
    <Page titleTag={pageTitleSuffixer(['Data Explorer'])}>
      <Switch>
        <Route
          path="/orgs/:orgID/data-explorer/save"
          component={SaveAsOverlay}
        />
        <Route
          path="/orgs/:orgID/data-explorer/delete-data"
          component={DEDeleteDataOverlay}
        />
        {isFlagEnabled('annotations') && (
          <Route
            path="/orgs/:orgID/data-explorer/add-annotation"
            component={AddAnnotationDEOverlay}
          />
        )}
        {isFlagEnabled('annotations') && (
          <Route
            path="/orgs/:orgID/data-explorer/edit-annotation"
            component={EditAnnotationDEOverlay}
          />
        )}
      </Switch>
      <GetResources resources={[ResourceType.Variables]}>
        <Page.Header fullWidth={true} testID="data-explorer--header">
          <Page.Title title="Data Explorer" />
          <RateLimitAlert />
        </Page.Header>
        <Page.ControlBar fullWidth={true}>
          <Page.ControlBarLeft>
            <ViewTypeDropdown />
            <VisOptionsButton />
            <FeatureFlag name="annotations">
              <AnnotationsToggleButton />
            </FeatureFlag>
          </Page.ControlBarLeft>
          <Page.ControlBarRight>
            <DeleteDataButton />
            <TimeZoneDropdown />
            <SaveAsButton />
          </Page.ControlBarRight>
        </Page.ControlBar>
        <FeatureFlag name="annotations">
          <AnnotationsControlBar />
        </FeatureFlag>
        <Page.Contents fullWidth={true} scrollable={false}>
          <DataExplorer />
        </Page.Contents>
      </GetResources>
    </Page>
  )
}

export default DataExplorerPage
