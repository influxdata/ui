// Libraries
import React, {FC} from 'react'
import {useDispatch, useSelector, connect} from 'react-redux'
import {
  ComponentSize,
  FlexBox,
  AlignItems,
  FlexDirection,
  Panel,
} from '@influxdata/clockface'
import {fromFlux, Table} from '@influxdata/giraffe'

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
import {History} from 'src/types/billing'

interface StateProps {
  selectedUsageID: string
}

interface OwnProps {
  history: History
}

type Props = OwnProps & StateProps

const UsageToday: FC<Props> = ({history, selectedUsageID}) => {
  const timeRange = useSelector(getTimeRange)
  const dispatch = useDispatch()

  const handleSetTimeRange = (range: TimeRange) => {
    dispatch(setTimeRange(range))
  }

  const getUsageSparkline = () => {
    const graphInfo = GRAPH_INFO.usage_stats.find(
      stat => stat.title === selectedUsageID
    )
    const {table, status} = csvToTable(history[graphInfo.column])

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

  const csvToTable = (csv): {table: Table; status: string} => {
    const {table} = fromFlux(csv)

    if (!table || !table.columns || table.columns.error) {
      if (
        table.columns.error.data.length &&
        table.columns.error.data[0] === 'Usage Query Timeout'
      ) {
        return {
          status: QUERY_RESULTS_STATUS_TIMEOUT,
          table: {} as Table,
        }
      }

      return {
        status: QUERY_RESULTS_STATUS_ERROR,
        table: {} as Table,
      }
    }

    if (!table.length) {
      return {
        status: QUERY_RESULTS_STATUS_EMPTY,
        table: {} as Table,
      }
    }

    return {status: QUERY_RESULTS_STATUS_SUCCESS, table}
  }

  const {table: billingTable, status: billingStatus} = csvToTable(
    history.billingStats
  )
  const {table: limitsTable, status: limitsStatus} = csvToTable(
    history.rateLimits
  )
  const timeRangeLabel =
    timeRange.label ?? `from ${timeRange.lower} to ${timeRange.upper}`

  console.log("billing", billingTable)

  return (
    <FlexBox
      alignItems={AlignItems.Stretch}
      direction={FlexDirection.Column}
      margin={ComponentSize.Small}
    >
      <BillingStatsPanel
        table={billingTable}
        status={billingStatus}
        widths={PANEL_CONTENTS_WIDTHS.billing_stats}
      />
      <TimeRangeDropdown
        onSetTimeRange={handleSetTimeRange}
        timeRange={timeRange}
      />
      <Panel className="usage--panel">
        <Panel.Header>
          <h4>{`Usage ${timeRangeLabel}`}</h4>
          <UsageDropdown />
        </Panel.Header>
        <PanelSection>{getUsageSparkline()}</PanelSection>
      </Panel>
      <Panel className="usage--panel">
        <Panel.Header>
          <h4>{`Rate Limits ${timeRangeLabel}`}</h4>
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

const mstp = () => {
  return {
    selectedUsageID: 'Data In (MB)',
  }
}

export default connect<StateProps>(mstp)(UsageToday)
