import React, {FC, useEffect, useCallback, useContext, useRef} from 'react'
import {default as StatelessTimeRangeDropdown} from 'src/shared/components/TimeRangeDropdown'
import {FlowContext} from 'src/flows/context/flow.current'
import {FlowQueryContext} from 'src/flows/context/flow.query'

// Utils
import {event} from 'src/cloud/utils/reporting'

const TimeRangeDropdown: FC = () => {
  const {flow, updateOther} = useContext(FlowContext)
  const {queryAll} = useContext(FlowQueryContext)
  const ref = useRef<string>(flow.range?.lower)

  const updateRange = useCallback(
    range => {
      event(
        'update_notebook_time_range',
        {
          type: range.type,
        },
        {upper: range.upper, lower: range.lower}
      )
      updateOther({range})
    },
    [updateOther]
  )

  useEffect(() => {
    if (!flow.range) {
      return
    }
    if (ref.current !== flow.range.lower) {
      queryAll()
      ref.current = flow.range.lower
    }
  }, [flow.range])

  return (
    <StatelessTimeRangeDropdown
      timeRange={flow.range}
      onSetTimeRange={updateRange}
      width={200}
    />
  )
}

export default TimeRangeDropdown
