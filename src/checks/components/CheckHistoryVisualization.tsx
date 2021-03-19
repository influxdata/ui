// Libraries
import React, {FC, useContext} from 'react'
import {AutoSizer} from 'react-virtualized'

// Components
import TimeSeries from 'src/shared/components/TimeSeries'
import {View, SUPPORTED_VISUALIZATIONS} from 'src/visualization'
import {CheckContext} from 'src/checks/utils/context'
import RawFluxDataTable from 'src/timeMachine/components/RawFluxDataTable'

const CheckHistoryVisualization: FC = () => {
  const properties = SUPPORTED_VISUALIZATIONS['check'].initial

  // NOTE: this is lazy, but i'm hoping we get rid of checks pretty soon
  // in favor of the new alerts interface (alex)
  const {id, type, query, updateStatuses} = useContext(CheckContext)

  if (type === 'custom') {
    return
  }

  return (
    <TimeSeries submitToken={0} queries={[query]} key={0} check={{id: id}}>
      {({giraffeResult, loading, errorMessage, isInitialFetch, statuses}) => {
        updateStatuses(statuses)

        // handle edge case where deadman check has non-numeric value
        if (
          giraffeResult &&
          !!giraffeResult.table.length &&
          giraffeResult.table.getColumnType('_value') !== 'number'
        ) {
          return (
            <AutoSizer>
              {({width, height}) => {
                return (
                  <RawFluxDataTable
                    parsedResults={giraffeResult}
                    width={width}
                    height={height}
                  />
                )
              }}
            </AutoSizer>
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
