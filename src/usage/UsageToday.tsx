// Libraries
import React, {FC} from 'react'
import {useDispatch, useSelector, connect} from 'react-redux'
import {
  ComponentSize,
  FlexBox,
  AlignItems,
  FlexDirection,
  Panel,
} from '@influxdata/clockface'

// Components
import UsageDropdown from 'src/usage/UsageDropdown'
import BillingStatsPanel from 'src/usage/BillingStatsPanel'
import TimeRangeDropdown from 'src/shared/components/TimeRangeDropdown'
import GraphTypeSwitcher from 'src/usage/GraphTypeSwitcher'

// Constants
import {GRAPH_INFO} from 'src/usage/Constants'
import {getTimeRange} from 'src/dashboards/selectors'
import {setTimeRange} from 'src/timeMachine/actions'
import {useUsage} from 'src/usage/UsagePage'

// Types
import {TimeRange} from 'src/types'

interface StateProps {
  selectedUsageID: string
}

type Props = StateProps

const UsageToday: FC<Props> = ({selectedUsageID}) => {
  const [{history}] = useUsage()
  const timeRange = useSelector(getTimeRange)
  const dispatch = useDispatch()

  const handleSetTimeRange = (range: TimeRange) => {
    dispatch(setTimeRange(range))
  }

  const getUsageSparkline = () => {
    const graphInfo = GRAPH_INFO.usage_stats.find(
      stat => stat.title === selectedUsageID
    )
    // TODO(ariel): make sure that the CSV is an actual CSV and not the rateLimits (it might be rateLimits, but i'm not sure)
    // const csv = history[graphInfo.column]
    const csv = history.rateLimits
    console.log({csv, graphInfo})
    return <GraphTypeSwitcher csv={csv} graphInfo={graphInfo} />
  }

  const timeRangeLabel =
    timeRange.label ?? `from ${timeRange.lower} to ${timeRange.upper}`

  return (
    <FlexBox
      alignItems={AlignItems.Stretch}
      direction={FlexDirection.Column}
      margin={ComponentSize.Small}
    >
      <BillingStatsPanel />
      <TimeRangeDropdown
        onSetTimeRange={handleSetTimeRange}
        timeRange={timeRange}
      />
      <Panel className="usage--panel">
        <Panel.Header>
          <h4>{`Usage ${timeRangeLabel}`}</h4>
          <UsageDropdown />
        </Panel.Header>
        <Panel.Body
          direction={FlexDirection.Column}
          margin={ComponentSize.Small}
          alignItems={AlignItems.Stretch}
        >
          {getUsageSparkline()}
        </Panel.Body>
      </Panel>
      <Panel className="usage--panel">
        <Panel.Header>
          <h4>{`Rate Limits ${timeRangeLabel}`}</h4>
        </Panel.Header>
        <Panel.Body
          direction={FlexDirection.Column}
          margin={ComponentSize.Small}
          alignItems={AlignItems.Stretch}
        >
          {GRAPH_INFO.rate_limits.map(graphInfo => {
            return (
              <GraphTypeSwitcher
                csv={history.rateLimits}
                graphInfo={graphInfo}
                key={graphInfo.title}
              />
            )
          })}
        </Panel.Body>
      </Panel>
    </FlexBox>
  )
}

const mstp = () => {
  return {
    selectedUsageID: 'Data In (MB)',
  }
}

export default connect<StateProps>(mstp)(UsageToday)
