import React, {FC, useContext} from 'react'

import {
  AlignItems,
  Appearance,
  ComponentSize,
  FlexDirection,
  Panel,
  ReflessPopover,
  PopoverInteraction,
  PopoverPosition,
  QuestionMarkTooltip,
} from '@influxdata/clockface'

import GraphTypeSwitcher from 'src/usage/GraphTypeSwitcher'
import {UsageContext} from 'src/usage/context/usage'

const graphInfo = [
  {
    title: 'Data In',
    groupColumns: [],
    column: 'writes_mb',
    units: 'MB',
    isGrouped: false,
    type: 'stat',
  },
  {
    title: 'Query Count',
    groupColumns: [],
    column: 'query_count',
    units: '',
    isGrouped: false,
    type: 'stat',
  },
  {
    title: 'Storage',
    groupColumns: [],
    column: 'storage_gb',
    units: 'GB-hr',
    isGrouped: false,
    type: 'stat',
  },
  {
    title: 'Data Out',
    groupColumns: [],
    column: 'reads_gb',
    units: 'GB',
    isGrouped: false,
    type: 'stat',
  },
]
const BillingStatsPanel: FC = () => {
  const {billingDateTime, billingStats} = useContext(UsageContext)

  const today = new Date().toISOString()
  const dateRange = `${billingDateTime} UTC to ${today} UTC`

  return (
    <Panel className="plan-type-panel usage--panel billing-stats--panel">
      <Panel.Header className="usage--billing-header">
        <ReflessPopover
          appearance={Appearance.Outline}
          distanceFromTrigger={16}
          contents={() => (
            <React.Fragment data-testid="usage-billing--popover">
              {dateRange}
            </React.Fragment>
          )}
          position={PopoverPosition.ToTheRight}
          showEvent={PopoverInteraction.Hover}
          hideEvent={PopoverInteraction.Hover}
          data-testid="usage-billing--title"
        >
          <h4 className="usage--billing-date-range">
            {`Billing Stats For ${billingDateTime} to Today`}
          </h4>
        </ReflessPopover>
        <QuestionMarkTooltip
          className="usage-tooltip"
          tooltipContents={
            <>
              Usage data is collected at the top of every hour.
              <br />
              If you don’t see any results here, check back soon!
              <br />
              <br />
              <a
                href="https://v2.docs.influxdata.com/v2.0/account-management/data-usage/"
                target="_blank"
                rel="noreferrer"
              >
                Read Documentation
              </a>
            </>
          }
        />
      </Panel.Header>
      <Panel.Body
        direction={FlexDirection.Column}
        margin={ComponentSize.Small}
        alignItems={AlignItems.Stretch}
        testID="billing-stats--graphs"
      >
        {billingStats.map((csv: string, i: number) => {
          return (
            <GraphTypeSwitcher
              key={csv}
              graphInfo={graphInfo[i]}
              csv={csv.trim()}
            />
          )
        })}
      </Panel.Body>
    </Panel>
  )
}

export default BillingStatsPanel
