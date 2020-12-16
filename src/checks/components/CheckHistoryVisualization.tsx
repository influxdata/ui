// Libraries
import React, {FC, createContext, useState} from 'react'
import {get} from 'lodash'

// Components
import TimeSeries from 'src/shared/components/TimeSeries'
import View from 'src/visualization/components/View'

// Types
import {ResourceIDs} from 'src/checks/reducers'
import {Check, TimeZone, CheckViewProperties} from 'src/types'

// Utils
import {createView} from 'src/views/helpers'

export const ResourceIDsContext = createContext<ResourceIDs>(null)

interface OwnProps {
  check: Check
  timeZone: TimeZone
}

type Props = OwnProps

const CheckHistoryVisualization: FC<Props> = ({check, timeZone}) => {
  const view = createView<CheckViewProperties>(get(check, 'threshold'))

  const [submitToken] = useState(0)
  const [manualRefresh] = useState(0)

  return (
    <TimeSeries
      submitToken={submitToken}
      queries={[check.query]}
      key={manualRefresh}
      check={check}
    >
      {({giraffeResult, loading, errorMessage, isInitialFetch, statuses}) => (
              <View
                  loading={loading}
                  error={errorMessage}
                  isInitial={isInitialFetch}
                    properties={view.properties}
                    result={giraffeResult}
                    timeRange={ranges}
                    timeZone={timeZone} />
      )}
    </TimeSeries>
  )
}

export default CheckHistoryVisualization
