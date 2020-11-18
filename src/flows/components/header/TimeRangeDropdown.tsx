import React, {FC, useMemo, useCallback, useContext} from 'react'
import {default as StatelessTimeRangeDropdown} from 'src/shared/components/TimeRangeDropdown'
import {FlowContext} from 'src/flows/context/flow.current'

// Utils
import {event} from 'src/cloud/utils/reporting'

const TimeRangeDropdown: FC = () => {
  const {update, flow} = useContext(FlowContext)

  const updateRange = useCallback(
    range => {
      event(
        'Time Range Updated',
        {
          type: range.type,
        },
        {upper: range.upper, lower: range.lower}
      )
      update({range})
    },
    [update]
  )

  return useMemo(() => {
    return (
      <StatelessTimeRangeDropdown
        timeRange={flow.range}
        onSetTimeRange={updateRange}
        width={200}
      />
    )
  }, [flow, updateRange])
}

export default TimeRangeDropdown
