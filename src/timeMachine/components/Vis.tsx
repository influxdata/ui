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
import EmptyQueryView, {ErrorFormat} from 'src/shared/components/EmptyQueryView'

// Utils
import {
  getActiveTimeMachine,
  getAnnotations,
  getFillColumnsSelection,
  getSymbolColumnsSelection,
  getVisTable,
  getXColumnSelection,
  getYColumnSelection,
  getYSeriesColumns,
} from 'src/timeMachine/selectors'
import {getTimeRangeWithTimezone} from 'src/dashboards/selectors'

// Types
import {RemoteDataState, AppState, ViewProperties} from 'src/types'

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
  ySeriesColumns,
  fillColumns,
  symbolColumns,
  annotations,
}) => {
  const {type} = viewProperties
  // If the current selections for `xColumn`/`yColumn`/ etc. are invalid given
  // the current Flux response, attempt to make a valid selection instead. This
  // fallback logic is contained within the selectors that supply each of these
  // props. Note that in a dashboard context, we display an error instead of
  // attempting to fall back to an valid selection.
  const resolvedViewProperties = {
    ...viewProperties,
    xColumn,
    [`${type === 'mosaic' ? 'ySeriesColumns' : 'yColumn'}`]:
      type === 'mosaic' ? ySeriesColumns : yColumn,
    fillColumns,
    symbolColumns,
  } as ViewProperties

  const noQueries =
    loading === RemoteDataState.NotStarted || !viewProperties.queries.length
  const timeMachineViewClassName = classnames('time-machine--view', {
    'time-machine--view__empty': noQueries,
  })

  if (isViewingRawData && files && files.length) {
    const [parsedResults] = files.flatMap(fromFlux)
    return (
      <div className={timeMachineViewClassName}>
        <ErrorBoundary>
          <EmptyQueryView
            loading={loading}
            errorMessage={errorMessage}
            errorFormat={ErrorFormat.Scroll}
            hasResults={!!parsedResults?.table?.length}
            isInitialFetch={isInitialFetch}
          >
            <AutoSizer>
              {({width, height}) => {
                return (
                  <RawFluxDataTable
                    parsedResults={parsedResults}
                    width={width}
                    height={height}
                  />
                )
              }}
            </AutoSizer>
          </EmptyQueryView>
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
        annotations={annotations}
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
  const ySeriesColumns = getYSeriesColumns(state)
  const fillColumns = getFillColumnsSelection(state)
  const symbolColumns = getSymbolColumnsSelection(state)
  const annotations = getAnnotations(state)

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
    ySeriesColumns,
    fillColumns,
    symbolColumns,
    timeRange: getActiveTimeRange(timeRange, viewProperties.queries),
    annotations,
  }
}

const connector = connect(mstp)

export default connector(
  memo(TimeMachineVis, (prev, next) => isEqual(prev, next))
)
