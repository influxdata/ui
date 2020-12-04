import React from 'react'
import {ComponentSize, EmptyState} from '@influxdata/clockface'
import {PROJECT_NAME_PLURAL} from 'src/flows'
import FlowCreateButton from 'src/flows/components/FlowCreateButton'

const FlowsIndexEmpty = () => {
  return (
    <EmptyState size={ComponentSize.Large}>
      <div className="flow-empty">
        <div className="flow-empty--graphic" />
        <EmptyState.Text>
          You haven't created any {PROJECT_NAME_PLURAL} yet
        </EmptyState.Text>
        <FlowCreateButton />
      </div>
    </EmptyState>
  )
}

export default FlowsIndexEmpty
