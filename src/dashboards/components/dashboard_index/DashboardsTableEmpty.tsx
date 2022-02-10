// Libraries
import React, {FC} from 'react'

// Components
import {EmptyState, ComponentSize} from '@influxdata/clockface'
import AddResourceDropdown from 'src/shared/components/AddResourceDropdown'
import DatalessEmptyState from 'src/cloud/components/experiments/DatalessEmptyState'
import {GoogleOptimizeExperiment} from 'src/cloud/components/experiments/GoogleOptimizeExperiment'
import GetResources from 'src/resources/components/GetResources'

// Actions
import {createDashboard} from 'src/dashboards/actions/thunks'

import {ResourceType} from 'src/types'

interface ComponentProps {
  searchTerm?: string
  onCreateDashboard: typeof createDashboard
  summonImportOverlay: () => void
  summonImportFromTemplateOverlay: () => void
}

const DashboardsTableEmpty: FC<ComponentProps> = ({
  searchTerm,
  onCreateDashboard,
  summonImportOverlay,
  summonImportFromTemplateOverlay,
}) => {
  if (searchTerm) {
    return (
      <EmptyState size={ComponentSize.Large} testID="empty-dashboards-list">
        <EmptyState.Text>No Dashboards match your search term</EmptyState.Text>
      </EmptyState>
    )
  }

  return (
    <GoogleOptimizeExperiment
      experimentID="H_NofBAhSW-hv6zaYaxeow"
      original={
        <EmptyState size={ComponentSize.Large} testID="empty-dashboards-list">
          <EmptyState.Text>
            Looks like you don't have any <b>Dashboards</b>, why not create one?
          </EmptyState.Text>
          <AddResourceDropdown
            onSelectNew={onCreateDashboard}
            onSelectImport={summonImportOverlay}
            onSelectTemplate={summonImportFromTemplateOverlay}
            resourceName="Dashboard"
          />
        </EmptyState>
      }
      variants={[
        <GetResources resources={[ResourceType.Buckets]} key="1">
          <DatalessEmptyState>
            <EmptyState
              size={ComponentSize.Large}
              testID="empty-dashboards-list"
            >
              <EmptyState.Text>
                Looks like you don't have any <b>Dashboards</b>, why not create
                one?
              </EmptyState.Text>
              <AddResourceDropdown
                onSelectNew={onCreateDashboard}
                onSelectImport={summonImportOverlay}
                onSelectTemplate={summonImportFromTemplateOverlay}
                resourceName="Dashboard"
              />
            </EmptyState>
          </DatalessEmptyState>
        </GetResources>,
      ]}
    />
  )
}

export default DashboardsTableEmpty
