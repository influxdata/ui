// Libraries
import React, {FC, useContext} from 'react'
import {
  ComponentSize,
  AlignItems,
  FlexDirection,
  Panel,
} from '@influxdata/clockface'

// Components
import UsageDropdown from 'src/usage/UsageDropdown'
import UsageXYGraph from 'src/usage/UsageXYGraph'
import {UsageContext} from 'src/usage/context/usage'

const UsageResults: FC = () => {
  const {selectedUsage, usageStats, usageStatsStatus, usageVectors, timeRange} =
    useContext(UsageContext)

  const usage = usageVectors.find(vector => selectedUsage === vector.name)
  let graph = null

  if (usage) {
    graph = (
      <UsageXYGraph
        fromFluxResult={usageStats}
        usageVector={usage}
        status={usageStatsStatus}
      />
    )
  } else if (usageVectors.length > 0) {
    graph = (
      <UsageXYGraph
        fromFluxResult={usageStats}
        usageVector={usageVectors[0]}
        status={usageStatsStatus}
      />
    )
  }

  return (
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
        {graph}
      </Panel.Body>
    </Panel>
  )
}

export default UsageResults
