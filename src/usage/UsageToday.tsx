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
import {fromFlux} from '@influxdata/giraffe'

// Components
import PanelSection from 'src/usage/PanelSection'
import UsageDropdown from 'src/usage/UsageDropdown'
import PanelSectionBody from 'src/usage/PanelSectionBody'
import BillingStatsPanel from 'src/usage/BillingStatsPanel'
import TimeRangeDropdown from 'src/shared/components/TimeRangeDropdown'

// Constants
import {GRAPH_INFO} from 'src/usage/Constants'
import {
  QUERY_RESULTS_STATUS_EMPTY,
  QUERY_RESULTS_STATUS_ERROR,
  QUERY_RESULTS_STATUS_SUCCESS,
  QUERY_RESULTS_STATUS_TIMEOUT,
  PANEL_CONTENTS_WIDTHS,
} from 'src/usage/Constants'
import {getTimeRange} from 'src/dashboards/selectors'
import {setTimeRange} from 'src/timeMachine/actions'

// Types
import {TimeRange} from 'src/types'

// Hooks
import {useUsage} from 'src/usage/UsagePage'

const UsageToday: FC = () => {
  const [{account, billingStart}] = useUsage()

  const timeRange = useSelector(getTimeRange)
  const dispatch = useDispatch()

  const handleSetTimeRange = (range: TimeRange) => {
    dispatch(setTimeRange(range))
  }

  //   const getUsageSparkline = () => {
  //     // const {history} = props
  //     const graphInfo = GRAPH_INFO.usage_stats.find(
  //       stat => stat.title === selectedUsageID
  //     )
  //     const {table, status} = csvToTable(history[graphInfo.column])

  //     return (
  //       <PanelSectionBody
  //         table={table}
  //         status={status}
  //         graphInfo={graphInfo}
  //         widths={PANEL_CONTENTS_WIDTHS.usage}
  //         key={graphInfo.title}
  //       />
  //     )
  //   }

  //   const csvToTable = csv => {
  //     const {table} = fromFlux(csv)

  //     if (!table || !table.columns || table.columns.error) {
  //       if (
  //         table.columns.error.data.length &&
  //         table.columns.error.data[0] === 'Usage Query Timeout'
  //       ) {
  //         return {
  //           status: QUERY_RESULTS_STATUS_TIMEOUT,
  //           table: {columns: {}, length: 0},
  //         }
  //       }

  //       return {
  //         status: QUERY_RESULTS_STATUS_ERROR,
  //         table: {columns: {}, length: 0},
  //       }
  //     }

  //     if (!table.length) {
  //       return {
  //         status: QUERY_RESULTS_STATUS_EMPTY,
  //         table: {columns: {}, length: 0},
  //       }
  //     }

  //     return {status: QUERY_RESULTS_STATUS_SUCCESS, table}
  //   }

  //   const {table: billingTable, status: billingStatus} = csvToTable(
  //     history.billing_stats
  //   )
  //   const {table: limitsTable, status: limitsStatus} = csvToTable(
  //     history.rate_limits
  //   )

  return (
    <FlexBox
      alignItems={AlignItems.Stretch}
      direction={FlexDirection.Column}
      margin={ComponentSize.Small}
    >
      <BillingStatsPanel
        // table={billingTable}
        // status={billingStatus}
        widths={PANEL_CONTENTS_WIDTHS.billing_stats}
      />
      <TimeRangeDropdown
        onSetTimeRange={handleSetTimeRange}
        timeRange={timeRange}
      />
      <Panel className="usage--panel">
        <Panel.Header>
          {/* TODO(Ariel): make this label work */}
          <h4>{`Usage ${timeRange.label}`}</h4>
          <UsageDropdown />
        </Panel.Header>
        {/* <PanelSection>{getUsageSparkline()}</PanelSection> */}
      </Panel>
      <Panel className="usage--panel">
        <Panel.Header>
          <h4>{`Rate Limits ${timeRange.label}`}</h4>
        </Panel.Header>
        <PanelSection>
          {/* {GRAPH_INFO.rate_limits.map(graphInfo => {
              return (
                <PanelSectionBody
                  table={limitsTable}
                  status={limitsStatus}
                  graphInfo={graphInfo}
                  widths={PANEL_CONTENTS_WIDTHS.rate_limits}
                  key={graphInfo.title}
                />
              )
            })} */}
        </PanelSection>
      </Panel>
    </FlexBox>
  )
}

export default UsageToday
