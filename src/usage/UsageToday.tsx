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
import UsageTimeRangeDropdown from 'src/usage/UsageTimeRangeDropdown'
import GraphTypeSwitcher from 'src/usage/GraphTypeSwitcher'
import {UsageContext} from 'src/usage/context/usage'

const usageGraphInfo = [
  {
    title: 'Data In (MB)',
    groupColumns: [],
    column: 'write_mb',
    units: 'MB',
    isGrouped: true,
    type: 'xy',
    pricingVersions: [3, 4],
  },
  {
    title: 'Query Count',
    groupColumns: [],
    column: 'query_count',
    units: '',
    isGrouped: false,
    type: 'xy',
    pricingVersions: [4],
  },
  {
    title: 'Storage (GB-hr)',
    groupColumns: [],
    column: 'storage_gb',
    units: 'GB',
    isGrouped: false,
    type: 'xy',
    pricingVersions: [3, 4],
  },
  {
    title: 'Data Out (GB)',
    groupColumns: [],
    column: 'reads_gb',
    units: 'GB',
    isGrouped: false,
    type: 'xy',
    pricingVersions: [4],
  },
]

const rateLimitGraphInfo = {
  title: 'Limit Events',
  groupColumns: ['_field'],
  column: '_value',
  units: '',
  isGrouped: true,
  type: 'xy',
}

const UsageToday: FC = () => {
  const {
    handleSetTimeRange,
    rateLimits,
    selectedUsage,
    timeRange,
    usageStats,
    usageVectors,
  } = useContext(UsageContext)

  const getUsageSparkline = () => {
    const usage = usageVectors.find(vector => selectedUsage === vector.name)
    const graphInfo =
      usageGraphInfo.find(stat => stat.column === usage.fluxKey) ??
      usageGraphInfo[0]

    return (
      <GraphTypeSwitcher fromFluxResult={usageStats} graphInfo={graphInfo} />
    )
  }

  return (
    <FlexBox
      alignItems={AlignItems.Stretch}
      direction={FlexDirection.Column}
      margin={ComponentSize.Small}
    >
      <BillingStatsPanel />
      <UsageTimeRangeDropdown
        onSetTimeRange={handleSetTimeRange}
        timeRange={timeRange}
      />
      <Panel className="usage--panel">
        <Panel.Header>
          <h4 data-testid="usage-header--timerange">{`Usage ${timeRange.label}`}</h4>
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
          <h4 data-testid="rate-limits-header--timerange">{`Rate Limits ${timeRange.label}`}</h4>
        </Panel.Header>
        <Panel.Body
          direction={FlexDirection.Column}
          margin={ComponentSize.Small}
          alignItems={AlignItems.Stretch}
        >
          <GraphTypeSwitcher
            fromFluxResult={rateLimits}
            graphInfo={rateLimitGraphInfo}
            key={rateLimitGraphInfo.title}
          />
        </Panel.Body>
      </Panel>
    </FlexBox>
  )
}

export default UsageToday
