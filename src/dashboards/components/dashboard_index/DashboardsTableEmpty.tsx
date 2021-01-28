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

import {ALLOW_IMPORT_FROM_TEMPLATE} from 'src/shared/constants' // spoiler alert: you can't import from templates
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
      experimentID="9H85dx92QTylCNHIL9Y5Sg"
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
            canImportFromTemplate={ALLOW_IMPORT_FROM_TEMPLATE}
          />
        </EmptyState>
      }
      variants={[
        <GetResources
          resources={[ResourceType.Buckets]}
          key="9H85dx92QTylCNHIL9Y5Sg-1"
        >
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
                canImportFromTemplate={ALLOW_IMPORT_FROM_TEMPLATE}
              />
            </EmptyState>
          </DatalessEmptyState>
        </GetResources>,
      ]}
    />
  )
}

export default DashboardsTableEmpty
