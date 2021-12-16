// Libraries
import React, {PureComponent, useMemo} from 'react'
import {connect, ConnectedProps, useSelector} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'

// Components
import TimeMachineFluxEditor from 'src/timeMachine/components/TimeMachineFluxEditor'
import CSVExportButton from 'src/shared/components/CSVExportButton'
import TimeMachineQueriesSwitcher from 'src/timeMachine/components/QueriesSwitcher'
import TimeMachineRefreshDropdown from 'src/timeMachine/components/RefreshDropdown'
import TimeRangeDropdown from 'src/shared/components/TimeRangeDropdown'
import TimeMachineQueryBuilder from 'src/timeMachine/components/QueryBuilder'
import SubmitQueryButton from 'src/timeMachine/components/SubmitQueryButton'
import RawDataToggle from 'src/timeMachine/components/RawDataToggle'
import QueryTabs from 'src/timeMachine/components/QueryTabs'
import EditorShortcutsToolTip from 'src/timeMachine/components/EditorShortcutsTooltip'
import {
  ComponentSize,
  FlexBox,
  FlexDirection,
  JustifyContent,
} from '@influxdata/clockface'

// Actions
import {
  setAutoRefresh,
  setTimeMachineTimeRange,
  setTimeRange,
} from 'src/timeMachine/actions'
import {enableUpdatedTimeRangeInVEO} from 'src/shared/actions/app'

// Utils
import {
  getActiveTimeMachine,
  getIsInCheckOverlay,
  getActiveQuery, getVisTable,
} from 'src/timeMachine/selectors'
import {getTimeRange} from 'src/dashboards/selectors'

// Types
import {AppState, TimeRange, AutoRefreshStatus, XYViewProperties} from 'src/types'
import {makeColorMappingFromColors} from '../../visualization/utils/colorMapping'
import {createGroupIDColumn} from '../../../../giraffe/giraffe'
import {setViewProperties} from 'src/timeMachine/actions'

type ReduxProps = ConnectedProps<typeof connector>
type RouterProps = RouteComponentProps<{
  cellID: string
  dashboardID: string
  orgID: string
}>
type Props = ReduxProps & RouterProps

class TimeMachineQueries extends PureComponent<Props> {
  public render() {
    const {timeRange, isInCheckOverlay, activeQuery} = this.props

    return (
      <div className="time-machine-queries">
        <div className="time-machine-queries--controls">
          <QueryTabs />
          <FlexBox
            direction={FlexDirection.Row}
            justifyContent={JustifyContent.FlexEnd}
            margin={ComponentSize.Small}
            className="time-machine-queries--buttons"
          >
            {activeQuery.editMode === 'advanced' && <EditorShortcutsToolTip />}
            <RawDataToggle />
            {!isInCheckOverlay && (
              <>
                <CSVExportButton />
                <TimeMachineRefreshDropdown />
                <TimeRangeDropdown
                  timeRange={timeRange}
                  onSetTimeRange={this.handleSetTimeRange}
                />
                <TimeMachineQueriesSwitcher />
              </>
            )}
            <SubmitQueryButton update={this.update}/>
          </FlexBox>
        </div>
        <div className="time-machine-queries--body">{this.queryEditor}</div>
      </div>
    )
  }

  private update = () => {
    const {view, results, update} = this.props
    const groupKey = [...results.fluxGroupKeyUnion, 'result']
    const [, fillColumnMap] = createGroupIDColumn(results.table, groupKey)

    const colorMapping = makeColorMappingFromColors(fillColumnMap, view.properties as XYViewProperties)

    console.log("UPDATE ----- REEEEEEE", {...view.properties, colorMapping})

    update({...view.properties, colorMapping} as XYViewProperties)
  }

  private handleSetTimeRange = (timeRange: TimeRange) => {
    const {
      autoRefresh,
      location: {pathname},
      onEnableUpdatedTimeRangeInVEO,
      onSetAutoRefresh,
      onSetTimeRange,
      setTimeMachineTimeRange,
      match: {
        params: {cellID, dashboardID, orgID},
      },
    } = this.props

    const inVEOMode =
      pathname === `orgs/${orgID}/dashboards/${dashboardID}/cell/${cellID}/edit`
    if (inVEOMode) {
      onEnableUpdatedTimeRangeInVEO()
    }
    onSetTimeRange(timeRange)
    setTimeMachineTimeRange(timeRange)
    if (timeRange.type === 'custom') {
      onSetAutoRefresh({...autoRefresh, status: AutoRefreshStatus.Disabled})
      return
    }

    if (autoRefresh.status === AutoRefreshStatus.Disabled) {
      if (autoRefresh.interval === 0) {
        onSetAutoRefresh({...autoRefresh, status: AutoRefreshStatus.Paused})
        return
      }

      onSetAutoRefresh({...autoRefresh, status: AutoRefreshStatus.Active})
    }
  }

  private get queryEditor(): JSX.Element {
    const {activeQuery} = this.props

    if (activeQuery.editMode === 'builder') {
      return <TimeMachineQueryBuilder />
    } else if (activeQuery.editMode === 'advanced') {
      return <TimeMachineFluxEditor />
    } else {
      return null
    }
  }
}

const mstp = (state: AppState) => {
  const timeRange = getTimeRange(state)
  const {autoRefresh, view} = getActiveTimeMachine(state)
  const results = getVisTable(state)

  const activeQuery = getActiveQuery(state)

  return {
    timeRange,
    activeQuery,
    autoRefresh,
    isInCheckOverlay: getIsInCheckOverlay(state),
    view,
    results
  }
}

const mdtp = {
  setTimeMachineTimeRange,
  onSetTimeRange: setTimeRange,
  onEnableUpdatedTimeRangeInVEO: enableUpdatedTimeRangeInVEO,
  onSetAutoRefresh: setAutoRefresh,
  update: setViewProperties,
}

const connector = connect(mstp, mdtp)

export default connector(withRouter(TimeMachineQueries))
