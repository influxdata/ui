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

    return (
      <GraphTypeSwitcher
        fromFluxResult={usageStats}
        usageVector={usage}
        type="xy"
      />
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
            usageVector={{
              name: 'Limit Events',
              fluxKey: '_value',
              unit: '',
            }}
            type="xy"
          />
        </Panel.Body>
      </Panel>
    </FlexBox>
  )
}

export default UsageToday
