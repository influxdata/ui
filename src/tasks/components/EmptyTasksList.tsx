// Libraries
import React, {PureComponent} from 'react'

// Components
import {EmptyState} from '@influxdata/clockface'
import AddResourceDropdown from 'src/shared/components/AddResourceDropdown'
import DatalessEmptyState from 'src/cloud/components/experiments/DatalessEmptyState'
import {GoogleOptimizeExperiment} from 'src/cloud/components/experiments/GoogleOptimizeExperiment'
import GetResources from 'src/resources/components/GetResources'

// Types
import {ComponentSize} from '@influxdata/clockface'
import {ResourceType} from 'src/types'

interface Props {
  searchTerm: string
  onCreate: () => void
  totalCount: number
  onImportTask: () => void
}

export default class EmptyTasksLists extends PureComponent<Props> {
  public render() {
    const {searchTerm, onCreate, totalCount, onImportTask} = this.props

    if (totalCount && searchTerm === '') {
      return (
        <EmptyState testID="empty-tasks-list" size={ComponentSize.Large}>
          <EmptyState.Text>{`All ${totalCount} of your Tasks are inactive`}</EmptyState.Text>
        </EmptyState>
      )
    }

    if (searchTerm === '') {
      return (
        <GoogleOptimizeExperiment
          experimentID="H_NofBAhSW-hv6zaYaxeow"
          original={
            <EmptyState testID="empty-tasks-list" size={ComponentSize.Large}>
              <EmptyState.Text>
                Looks like you don't have any <b>Tasks</b>, why not create one?
              </EmptyState.Text>
              <AddResourceDropdown
                onSelectNew={onCreate}
                onSelectImport={onImportTask}
                resourceName="Task"
              />
            </EmptyState>
          }
          variants={[
            <GetResources resources={[ResourceType.Buckets]} key="1">
              <DatalessEmptyState>
                <EmptyState
                  testID="empty-tasks-list"
                  size={ComponentSize.Large}
                >
                  <EmptyState.Text>
                    Looks like you don't have any <b>Tasks</b>, why not create
                    one?
                  </EmptyState.Text>
                  <AddResourceDropdown
                    onSelectNew={onCreate}
                    onSelectImport={onImportTask}
                    resourceName="Task"
                  />
                </EmptyState>
              </DatalessEmptyState>
            </GetResources>,
          ]}
        />
      )
    }

    return (
      <EmptyState testID="empty-tasks-list" size={ComponentSize.Large}>
        <EmptyState.Text>No Tasks match your search term</EmptyState.Text>
      </EmptyState>
    )
  }
}
