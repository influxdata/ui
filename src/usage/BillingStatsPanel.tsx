// Libraries
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
import UsageSingleStat from 'src/usage/UsageSingleStat'
import {UsageContext} from 'src/usage/context/usage'
import {FromFluxResult} from '@influxdata/giraffe'

// Types
import {UsageVector, InternalFromFluxResult} from 'src/types'

const BillingStatsPanel: FC = () => {
  const {billingDateTime, billingStats, usageVectors} = useContext(UsageContext)

  const today = new Date().toISOString()
  const dateRange = `${billingDateTime} UTC to ${today} UTC`

  const [billingDate] = billingDateTime.split('T')

  return (
    <Panel className="plan-type-panel usage--panel billing-stats--panel">
      <Panel.Header className="usage--billing-header">
        <ReflessPopover
          appearance={Appearance.Outline}
          distanceFromTrigger={16}
          contents={() => (
            <div data-testid="usage-billing--popover">{dateRange}</div>
          )}
          position={PopoverPosition.ToTheRight}
          showEvent={PopoverInteraction.Hover}
          hideEvent={PopoverInteraction.Hover}
          data-testid="usage-billing--title"
        >
          <h4 className="usage--billing-date-range">
            {billingDate
              ? `Billing Stats for ${billingDate} to Today`
              : 'Billing Stats'}
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
                href="https://docs.influxdata.com/influxdb/cloud/account-management/data-usage/"
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
        className="billing-stats--graph-body"
      >
        {usageVectors?.map((vector: UsageVector) => {
          // Find the matching CSV for the usageVector
          const fromFluxResult = (billingStats?.find(
            (result: FromFluxResult) => {
              const {table, error} = result
              if (!table.length || error) {
                return false
              }
              return table.columnKeys.includes(vector.fluxKey)
            }
          ) ?? {table: {}}) as InternalFromFluxResult

          // update the CSV's _value column to the fluxKey since Giraffe only displays the `_value` of the parsed results
          if (fromFluxResult.table?.columns) {
            fromFluxResult.table.columns['_value'] =
              fromFluxResult.table.columns[vector.fluxKey]
          }

          return (
            <UsageSingleStat
              key={vector.fluxKey}
              usageVector={vector}
              fromFluxResult={fromFluxResult}
              length={usageVectors.length}
            />
          )
        })}
      </Panel.Body>
    </Panel>
  )
}

export default BillingStatsPanel
