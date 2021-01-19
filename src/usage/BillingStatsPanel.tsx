import React from 'react'

import {
  AlignItems,
  ComponentSize,
  FlexDirection,
  Panel,
  ReflessPopover,
  PopoverInteraction,
  PopoverPosition,
  QuestionMarkTooltip,
} from '@influxdata/clockface'

import GraphTypeSwitcher from 'src/usage/GraphTypeSwitcher'

import {GRAPH_INFO} from 'src/usage/Constants'
import {useUsage} from 'src/usage/UsagePage'
import {DUMMY_PRICING_VERSION_TO_DELETE} from 'src/usage/utils'

const billingStats = (pricingVersion = 3) => {
  return GRAPH_INFO.billing_stats.filter(stat =>
    stat.pricingVersions.includes(pricingVersion)
  )
}

const BillingStatsPanel = () => {
  const [
    {
      billingStart: {date: billingStartDate, time: billingStartTime},
      history,
    },
  ] = useUsage()

  const csvs = history.billingStats.split('\n\n')

  const today = new Date().toISOString()
  const dateRange = `${billingStartTime} UTC to ${today} UTC`

  return (
    <Panel className="plan-type-panel usage--panel billing-stats--panel">
      <Panel.Header className="usage--billing-header">
        <ReflessPopover
          distanceFromTrigger={16}
          contents={() => <>{dateRange}</>}
          position={PopoverPosition.ToTheRight}
          showEvent={PopoverInteraction.Hover}
          hideEvent={PopoverInteraction.Hover}
        >
          <h4 className="usage--billing-date-range">
            {`Billing Stats For ${billingStartDate} to Today`}
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
      >
        {/* TODO(ariel): fix this so that we map over the parsed CSV and pass in a table for each version */}
        {billingStats(DUMMY_PRICING_VERSION_TO_DELETE).map((graphInfo, i) => {
          return (
            <GraphTypeSwitcher
              key={graphInfo.title}
              graphInfo={graphInfo}
              csv={csvs[i].trim()}
            />
          )
        })}
      </Panel.Body>
    </Panel>
  )
}

export default BillingStatsPanel
