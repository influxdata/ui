// Libraries
import React, {FC, memo} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {AutoSizer} from 'react-virtualized'
import classnames from 'classnames'
import {fromFlux} from '@influxdata/giraffe'
import {isEqual} from 'lodash'

// Components
import {View} from 'src/visualization'
import RawFluxDataTable from 'src/timeMachine/components/RawFluxDataTable'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

// Utils
import {getActiveTimeMachine} from 'src/timeMachine/selectors'
import {
  getVisTable,
  getXColumnSelection,
  getYColumnSelection,
  getFillColumnsSelection,
  getSymbolColumnsSelection,
} from 'src/timeMachine/selectors'
import {getTimeRangeWithTimezone, getTimeZone} from 'src/dashboards/selectors'

// Types
import {RemoteDataState, AppState} from 'src/types'

// Selectors
import {getActiveTimeRange} from 'src/timeMachine/selectors/index'

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps

const TimeMachineVis: FC<Props> = ({
  loading,
  errorMessage,
  timeRange,
  isInitialFetch,
  isViewingRawData,
  files,
  viewProperties,
  giraffeResult,
  xColumn,
  yColumn,
  fillColumns,
  symbolColumns,
  timeZone,
}) => {
  // If the current selections for `xColumn`/`yColumn`/ etc. are invalid given
  // the current Flux response, attempt to make a valid selection instead. This
  // fallback logic is contained within the selectors that supply each of these
  // props. Note that in a dashboard context, we display an error instead of
  // attempting to fall back to an valid selection.
  const resolvedViewProperties = {
    ...viewProperties,
    xColumn,
    yColumn,
    fillColumns,
    symbolColumns,
  }

  const noQueries =
    loading === RemoteDataState.NotStarted || !viewProperties.queries.length
  const timeMachineViewClassName = classnames('time-machine--view', {
    'time-machine--view__empty': noQueries,
  })

  if (isViewingRawData) {
    return (
      <div className={timeMachineViewClassName}>
        <ErrorBoundary>
          <AutoSizer>
            {({width, height}) => {
              const [parsedResults] = files.flatMap(fromFlux)
              return (
                <RawFluxDataTable
                  parsedResults={parsedResults}
                  width={width}
                  height={height}
                />
              )
            }}
          </AutoSizer>
        </ErrorBoundary>
      </div>
    )
  }

  return (
    <div className={timeMachineViewClassName}>
      <View
        loading={loading}
        error={errorMessage}
        isInitial={isInitialFetch}
        properties={resolvedViewProperties}
        result={giraffeResult}
        timeRange={timeRange}
        timeZone={timeZone}
      />
    </div>
  )
}

const mstp = (state: AppState) => {
  const activeTimeMachine = getActiveTimeMachine(state)
  const {
    isViewingRawData,
    view: {properties: viewProperties},
    queryResults: {status: loading, errorMessage, isInitialFetch, files},
  } = activeTimeMachine
  const timeRange = getTimeRangeWithTimezone(state)

  const giraffeResult = getVisTable(state)
  const xColumn = getXColumnSelection(state)
  const yColumn = getYColumnSelection(state)
  const fillColumns = getFillColumnsSelection(state)
  const symbolColumns = getSymbolColumnsSelection(state)
  const timeZone = getTimeZone(state)

  return {
    loading,
    errorMessage,
    isInitialFetch,
    files,
    viewProperties,
    isViewingRawData,
    giraffeResult,
    xColumn,
    yColumn,
    fillColumns,
    symbolColumns,
    timeZone,
    timeRange: getActiveTimeRange(timeRange, viewProperties.queries),
  }
}

const connector = connect(mstp)

export default connector(
  memo(TimeMachineVis, (prev, next) => isEqual(prev, next))
)
