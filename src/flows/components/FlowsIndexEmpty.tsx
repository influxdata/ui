import React from 'react'
import {ComponentSize, EmptyState} from '@influxdata/clockface'
import {PROJECT_NAME_PLURAL} from 'src/flows'
import 'src/flows/components/EmptyPipeList.scss'

const FlowsIndexEmpty = () => {
  return (
    <EmptyState size={ComponentSize.ExtraSmall}>
      <div className="flow-empty">
        <div className="flow-empty--graphic" />
        <EmptyState.Text className="margin-bottom-zero">
          {PROJECT_NAME_PLURAL} will show up here as you create them
        </EmptyState.Text>
      </div>
    </EmptyState>
  )
}

export default FlowsIndexEmpty
