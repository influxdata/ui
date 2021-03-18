// Libraries
import React, {FC, useContext} from 'react'
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
import {UsageContext} from 'src/usage/context/usage'

const usageGraphInfo = [
  {
    title: 'Data In (MB)',
    groupColumns: [],
    column: 'write_mb',
    units: 'MB',
    isGrouped: true,
    type: 'sparkline',
    pricingVersions: [3, 4],
  },
  {
    title: 'Query Count',
    groupColumns: [],
    column: 'query_count',
    units: '',
    isGrouped: false,
    type: 'sparkline',
    pricingVersions: [4],
  },
  {
    title: 'Storage (GB-hr)',
    groupColumns: [],
    column: 'storage_gb',
    units: 'GB',
    isGrouped: false,
    type: 'sparkline',
    pricingVersions: [3, 4],
  },
  {
    title: 'Data Out (GB)',
    groupColumns: [],
    column: 'reads_gb',
    units: 'GB',
    isGrouped: false,
    type: 'sparkline',
    pricingVersions: [4],
  },
]

const rateLimitGraphInfo = {
  title: 'Limit Events',
  groupColumns: ['_field'],
  column: '_value',
  units: '',
  isGrouped: true,
  type: 'sparkline',
}

const UsageToday: FC = () => {
  const {
    handleSetTimeRange,
    rateLimits,
    selectedUsage,
    timeRange,
    usageStats,
  } = useContext(UsageContext)

  const getUsageSparkline = () => {
    const graphInfo = usageGraphInfo.find(stat => stat.title === selectedUsage)
    return <GraphTypeSwitcher csv={usageStats} graphInfo={graphInfo} />
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
          <h4 data-testid="rate-limits-header--timerange">{`Rate Limits ${timeRangeLabel}`}</h4>
        </Panel.Header>
        <Panel.Body
          direction={FlexDirection.Column}
          margin={ComponentSize.Small}
          alignItems={AlignItems.Stretch}
        >
          <GraphTypeSwitcher
            csv={rateLimits}
            graphInfo={rateLimitGraphInfo}
            key={rateLimitGraphInfo.title}
          />
        </Panel.Body>
      </Panel>
    </FlexBox>
  )
}

export default UsageToday
