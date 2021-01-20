import React, {FC, useEffect, useState, useCallback, useContext} from 'react'
import {default as StatelessTimeRangeDropdown} from 'src/shared/components/TimeRangeDropdown'
import {FlowContext} from 'src/flows/context/flow.current'
import {QueryContext} from 'src/flows/context/query'

// Utils
import {event} from 'src/cloud/utils/reporting'

const TimeRangeDropdown: FC = () => {
  const {update, flow} = useContext(FlowContext)
  const [range, setRange] = useState(null)
  const {queryAll} = useContext(QueryContext)

  const updateRange = useCallback(
    range => {
      event(
        'update_notebook_time_range',
        {
          type: range.type,
        },
        {upper: range.upper, lower: range.lower}
      )
      update({range})
      setRange(`${range.lower} to ${range.upper || 'now'}`)
    },
    [update]
  )

  useEffect(() => {
    if (!range) {
      return
    }
    queryAll()
  }, [range])

  return (
    <StatelessTimeRangeDropdown
      timeRange={flow.range}
      onSetTimeRange={updateRange}
      width={200}
    />
  )
}

export default TimeRangeDropdown
