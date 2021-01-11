// Libraries
import React, {Component} from 'react'
import {
  ComponentSize,
  FlexBox,
  AlignItems,
  FlexDirection,
  Panel,
} from '@influxdata/clockface'
import {fromFlux} from '@influxdata/vis'

// Components
import PanelSection from 'js/components/Usage/PanelSection'
import UsageDropdown from 'js/components/Usage/UsageDropdown'
import PanelSectionBody from 'js/components/Usage/PanelSectionBody'
import BillingStatsPanel from 'js/components/Usage/BillingStatsPanel'
import TimeRangeDropdown from './TimeRangeDropdown'

// Constants
import {GRAPH_INFO} from 'js/components/Usage/Constants'
import {
  QUERY_RESULTS_STATUS_EMPTY,
  QUERY_RESULTS_STATUS_ERROR,
  QUERY_RESULTS_STATUS_SUCCESS,
  QUERY_RESULTS_STATUS_TIMEOUT,
  PANEL_CONTENTS_WIDTHS,
} from 'js/components/Usage/Constants'

class UsageToday extends Component {
  constructor(props) {
    super(props)

    this.ranges = {
      h24: 'Past 24 Hours',
      d7: 'Past 7 Days',
      d30: 'Past 30 Days',
    }

    this.state = {
      selectedUsageID: 'Data In (MB)',
    }
  }

  render() {
    const {history, selectedRange, billingStart, pricingVersion} = this.props

    const {table: billingTable, status: billingStatus} = this.csvToTable(
      history.billing_stats
    )
    const {table: limitsTable, status: limitsStatus} = this.csvToTable(
      history.rate_limits
    )
    const {selectedUsageID} = this.state

    return (
      <FlexBox
        alignItems={AlignItems.Stretch}
        direction={FlexDirection.Column}
        margin={ComponentSize.Small}
      >
        <BillingStatsPanel
          table={billingTable}
          status={billingStatus}
          billingStart={billingStart}
          widths={PANEL_CONTENTS_WIDTHS.billing_stats}
          pricingVersion={pricingVersion}
        />
        <TimeRangeDropdown
          selectedTimeRange={this.ranges[selectedRange]}
          dropdownOptions={this.ranges}
          onSelect={this.handleTimeRangeChange}
        />
        <Panel className="usage--panel">
          <Panel.Header>
            <h4>{`Usage ${this.ranges[selectedRange]}`}</h4>
            <UsageDropdown
              selectedUsage={selectedUsageID}
              onSelect={this.handleUsageChange}
              pricingVersion={pricingVersion}
            />
          </Panel.Header>
          <PanelSection>{this.getUsageSparkline()}</PanelSection>
        </Panel>
        <Panel className="usage--panel">
          <Panel.Header>
            <h4>{`Rate Limits ${this.ranges[selectedRange]}`}</h4>
          </Panel.Header>
          <PanelSection>
            {GRAPH_INFO.rate_limits.map(graphInfo => {
              return (
                <PanelSectionBody
                  table={limitsTable}
                  status={limitsStatus}
                  graphInfo={graphInfo}
                  widths={PANEL_CONTENTS_WIDTHS.rate_limits}
                  key={graphInfo.title}
                />
              )
            })}
          </PanelSection>
        </Panel>
      </FlexBox>
    )
  }

  getUsageSparkline() {
    const {history} = this.props
    const {selectedUsageID} = this.state

    const graphInfo = GRAPH_INFO.usage_stats.find(
      stat => stat.title === selectedUsageID
    )
    const {table, status} = this.csvToTable(history[graphInfo.column])

    return (
      <PanelSectionBody
        table={table}
        status={status}
        graphInfo={graphInfo}
        widths={PANEL_CONTENTS_WIDTHS.usage}
        key={graphInfo.title}
      />
    )
  }

  handleUsageChange = v => {
    this.setState({selectedUsageID: v})
  }

  csvToTable = csv => {
    const {table} = fromFlux(csv)

    if (!table || !table.columns || table.columns.error) {
      if (
        table.columns.error.data.length &&
        table.columns.error.data[0] === 'Usage Query Timeout'
      ) {
        return {
          status: QUERY_RESULTS_STATUS_TIMEOUT,
          table: {columns: {}, length: 0},
        }
      }

      return {
        status: QUERY_RESULTS_STATUS_ERROR,
        table: {columns: {}, length: 0},
      }
    }

    if (!table.length) {
      return {
        status: QUERY_RESULTS_STATUS_EMPTY,
        table: {columns: {}, length: 0},
      }
    }

    return {status: QUERY_RESULTS_STATUS_SUCCESS, table}
  }
}

export default UsageToday
