// Libraries
import React, {FC} from 'react'
import {useSelector, useDispatch} from 'react-redux'

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

// Actions and Selectors
import {
  setAutoRefresh,
  setTimeMachineTimeRange,
  setTimeRange,
} from 'src/timeMachine/actions'
import {getAllVariables} from 'src/variables/selectors'

// Utils
import {
  getActiveTimeMachine,
  getIsInCheckOverlay,
  getActiveQuery,
} from 'src/timeMachine/selectors'
import {getTimeRange} from 'src/dashboards/selectors'

// Types
import {TimeRange, AutoRefreshStatus} from 'src/types'

type Props = {
  maxHeight: number
}

const TimeMachineQueries: FC<Props> = ({maxHeight}) => {
  const dispatch = useDispatch()
  const timeRange = useSelector(getTimeRange)
  const {autoRefresh} = useSelector(getActiveTimeMachine)
  const activeQuery = useSelector(getActiveQuery)
  const isInCheckOverlay = useSelector(getIsInCheckOverlay)
  const variables = useSelector(getAllVariables)

  const handleSetTimeRange = (timeRange: TimeRange) => {
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

  let queryEditor = null
  if (activeQuery.editMode === 'builder') {
    queryEditor = <TimeMachineQueryBuilder />
  } else if (activeQuery.editMode === 'advanced') {
    queryEditor = <TimeMachineFluxEditor variables={variables} />
  }
  const dropdownMaxHeight = maxHeight * 0.5

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
              <CSVExportButton disabled={activeQuery.text === ''} />
              <TimeMachineRefreshDropdown />
              <TimeRangeDropdown
                timeRange={timeRange}
                onSetTimeRange={handleSetTimeRange}
                maxHeight={dropdownMaxHeight}
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
