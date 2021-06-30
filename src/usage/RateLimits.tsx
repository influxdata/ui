// Libraries
import React, {FC, useContext} from 'react'
import {
  ComponentSize,
  AlignItems,
  FlexDirection,
  Panel,
} from '@influxdata/clockface'

// Components
import UsageXYGraph from 'src/usage/UsageXYGraph'
import {UsageContext} from 'src/usage/context/usage'

const RateLimits: FC = () => {
  const {rateLimits, rateLimitsStatus, timeRange} = useContext(UsageContext)

  return (
    <Panel className="usage--panel">
      <Panel.Header>
        <h4 data-testid="rate-limits-header--timerange">{`Rate Limits ${timeRange.label}`}</h4>
      </Panel.Header>
      <Panel.Body
        direction={FlexDirection.Column}
        margin={ComponentSize.Small}
        alignItems={AlignItems.Stretch}
      >
        <UsageXYGraph
          fromFluxResult={rateLimits}
          usageVector={{
            name: 'Limit Events',
            fluxKey: '_value',
            unit: '',
          }}
          status={rateLimitsStatus}
        />
      </Panel.Body>
    </Panel>
  )
}

export default RateLimits
