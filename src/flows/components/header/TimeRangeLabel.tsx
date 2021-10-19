import React, {FC, useEffect, useContext} from 'react'
import {FlowContext} from 'src/flows/context/flow.current'
import {getTimeZone} from 'src/dashboards/selectors'
import {useSelector} from 'react-redux'
import {getTimeRangeLabel} from 'src/shared/utils/duration'

const TimeRangeLabel: FC = () => {
  const {flow} = useContext(FlowContext)
  const timeZone = useSelector(getTimeZone)

  useEffect(() => {
    if (!flow.range) {
      return
    }
  }, [flow.range])

  return (
    <h4 style={{paddingRight: '10px', margin: '0'}}>
      {getTimeRangeLabel(flow.range, timeZone)}
    </h4>
  )
}

export default TimeRangeLabel
