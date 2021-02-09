// Libraries
import React, {FC, useContext} from 'react'

// Components
import TimeSeries from 'src/shared/components/TimeSeries'
import {View, SUPPORTED_VISUALIZATIONS} from 'src/visualization'
import {CheckContext} from 'src/checks/utils/context'

// Types
import {TimeZone} from 'src/types'

interface Props {
  timeZone: TimeZone
}

const CheckHistoryVisualization: FC<Props> = ({timeZone}) => {
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

        return (
          <View
            loading={loading}
            error={errorMessage}
            isInitial={isInitialFetch}
            properties={properties}
            result={giraffeResult}
            timeZone={timeZone}
          />
        )
      }}
    </TimeSeries>
  )
}

export default CheckHistoryVisualization
