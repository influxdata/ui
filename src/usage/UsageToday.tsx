// Libraries
import React, {FC, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
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

const UsageToday: FC = () => {
  const [{history}] = useUsage()
  const [selectedUsage, setSelectedUsage] = useState('Data In (MB)')

  const timeRange = useSelector(getTimeRange)
  const dispatch = useDispatch()

  const handleSetTimeRange = (range: TimeRange) => {
    dispatch(setTimeRange(range))
  }

  const getUsageSparkline = () => {
    const graphInfo = GRAPH_INFO.usageStats.find(
      stat => stat.title === selectedUsage
    )
    // TODO(ariel): make sure that the CSV is an actual CSV and not the rateLimits (it might be rateLimits, but i'm not sure)
    // const csv = history[graphInfo.column]
    const csv = history.usageStats
    return <GraphTypeSwitcher csv={csv} graphInfo={graphInfo} />
  }

  const getTimeRangeLabel = () => {
    switch (timeRange.type) {
      case 'selectable-duration':
        return timeRange.label
      case 'duration':
        return `from ${timeRange.lower} to now`
      default:
        return `from ${new Date(timeRange.lower).toISOString()} to ${new Date(
          timeRange.upper
        ).toISOString()}`
    }
  }

  const timeRangeLabel = getTimeRangeLabel()

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
          <h4 data-testid="usage-header--timerange">{`Usage ${timeRangeLabel}`}</h4>
          <UsageDropdown
            selectedUsage={selectedUsage}
            setSelectedUsage={setSelectedUsage}
          />
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
          <h4 data-testid="rate-limits-header--timerange">{`Rate Limits ${timeRangeLabel}`}</h4>
        </Panel.Header>
        <Panel.Body
          direction={FlexDirection.Column}
          margin={ComponentSize.Small}
          alignItems={AlignItems.Stretch}
        >
          {GRAPH_INFO.rateLimits.map(graphInfo => {
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

export default UsageToday
