// Libraries
import React from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {useParams, useLocation} from 'react-router-dom'

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
  getActiveQuery,
} from 'src/timeMachine/selectors'
import {getTimeRange} from 'src/dashboards/selectors'

// Types
import {TimeRange, AutoRefreshStatus} from 'src/types'

const TimeMachineQueries: React.FC = () => {
  const {cellID, dashboardID, orgID} = useParams<{
    cellID: string
    dashboardID: string
    orgID: string
  }>()
  const {pathname} = useLocation()
  const dispatch = useDispatch()
  const timeRange = useSelector(getTimeRange)
  const {autoRefresh} = useSelector(getActiveTimeMachine)
  const activeQuery = useSelector(getActiveQuery)
  const isInCheckOverlay = useSelector(getIsInCheckOverlay)

  const queryEditor = () => {
    if (activeQuery.editMode === 'builder') {
      return <TimeMachineQueryBuilder />
    } else if (activeQuery.editMode === 'advanced') {
      return <TimeMachineFluxEditor />
    } else {
      return null
    }
  }

  const handleSetTimeRange = (timeRange: TimeRange) => {
    const inVEOMode =
      pathname === `orgs/${orgID}/dashboards/${dashboardID}/cell/${cellID}/edit`
    if (inVEOMode) {
      dispatch(enableUpdatedTimeRangeInVEO())
    }
    dispatch(setTimeRange(timeRange))
    dispatch(setTimeMachineTimeRange(timeRange))
    if (timeRange.type === 'custom') {
      dispatch(
        setAutoRefresh({...autoRefresh, status: AutoRefreshStatus.Disabled})
      )
      return
    }

    if (autoRefresh.status === AutoRefreshStatus.Disabled) {
      if (autoRefresh.interval === 0) {
        dispatch(
          setAutoRefresh({...autoRefresh, status: AutoRefreshStatus.Paused})
        )
        return
      }

      dispatch(
        setAutoRefresh({...autoRefresh, status: AutoRefreshStatus.Active})
      )
    }
  }

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
                onSetTimeRange={handleSetTimeRange}
              />
              <TimeMachineQueriesSwitcher />
            </>
          )}
          <SubmitQueryButton />
        </FlexBox>
      </div>
      <div className="time-machine-queries--body">{queryEditor}</div>
    </div>
  )
}

export default TimeMachineQueries
