// Libraries
import React, {FC, useContext} from 'react'

// Components
import TimeSeries from 'src/shared/components/TimeSeries'
import {View, SUPPORTED_VISUALIZATIONS} from 'src/visualization'
import {CheckContext} from 'src/checks/utils/context'
import {SimpleTable} from 'src/visualization/types/SimpleTable/view'
import {SimpleTableViewProperties} from 'src/types'

const CheckHistoryVisualization: FC = () => {
  // NOTE: this is lazy, but i'm hoping we get rid of checks pretty soon
  // in favor of the new alerts interface (alex)
  const {id, type, query, updateStatuses} = useContext(CheckContext)
  const properties = SUPPORTED_VISUALIZATIONS['check'].initial
  const simpleTableProperties = {
    type: 'simple-table',
    showAll: true,
  } as SimpleTableViewProperties

  if (type === 'custom') {
    return
  }

  return (
    <TimeSeries
      submitToken={0}
      queries={[query]}
      key={0}
      check={{id: id}}
      updateStatuses={updateStatuses}
    >
      {({giraffeResult, loading, errorMessage, isInitialFetch}) => {
        // handle edge case where deadman check has non-numeric value
        if (
          giraffeResult &&
          !!giraffeResult.table.length &&
          giraffeResult.table.getColumnType('_value') !== 'number'
        ) {
          return (
            <SimpleTable
              result={giraffeResult}
              properties={simpleTableProperties}
            />
          )
        }

        return (
          <View
            loading={loading}
            error={errorMessage}
            isInitial={isInitialFetch}
            properties={properties}
            result={giraffeResult}
          />
        )
      }}
    </TimeSeries>
  )
}

export default CheckHistoryVisualization
