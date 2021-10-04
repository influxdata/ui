import React, {FC, useEffect, useContext} from 'react'
import {FlowContext} from 'src/flows/context/flow.current'
import {getTimeZone} from 'src/dashboards/selectors'
import {connect} from 'react-redux'
import {getTimeRangeLabel} from 'src/shared/utils/duration'
import {TimeZone} from 'src/types'

interface Props {
  timeZone: TimeZone
}
const TimeRangeLabel: FC<Props> = ({timeZone}) => {
  const {flow} = useContext(FlowContext)

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

const mapStateToProps = state => ({
  timeZone: getTimeZone(state),
})

export default connect(mapStateToProps)(TimeRangeLabel)
