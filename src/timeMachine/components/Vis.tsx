// Libraries
import React, {FC, memo} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {AutoSizer} from 'react-virtualized'
import classnames from 'classnames'
import {fromFlux} from '@influxdata/giraffe'
import {isEqual} from 'lodash'

// Components
import {View} from 'src/visualization'
import {SimpleTableViewProperties} from 'src/visualization/types/SimpleTable'
import RawFluxDataTable from 'src/timeMachine/components/RawFluxDataTable'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import EmptyQueryView, {ErrorFormat} from 'src/shared/components/EmptyQueryView'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

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
import {
  setIsDisabledViewRawData,
  setIsViewingRawData,
} from 'src/timeMachine/actions'

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
  setViewRawData,
  setDisableRawData,
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
  let resolvedViewProperties = {
    ...viewProperties,
    xColumn,
    [`${type === 'mosaic' ? 'ySeriesColumns' : 'yColumn'}`]:
      type === 'mosaic' ? ySeriesColumns : yColumn,
    fillColumns,
    symbolColumns,
  } as ViewProperties | SimpleTableViewProperties

  if (isViewingRawData && isFlagEnabled('simple-table')) {
    resolvedViewProperties = {
      type: 'simple-table',
    }
  }

  const noQueries =
    loading === RemoteDataState.NotStarted || !viewProperties.queries.length
  const timeMachineViewClassName = classnames('time-machine--view', {
    'time-machine--view__empty': noQueries,
  })

  // Handles deadman check edge case to allow non-numeric values
  if (
    !!giraffeResult.table.length &&
    !isViewingRawData &&
    resolvedViewProperties.type === 'check' &&
    giraffeResult.table.getColumnType('_value') !== 'number'
  ) {
    setViewRawData(true)
    setDisableRawData(true)
    return null
  } else if (
    !!giraffeResult.table.length &&
    isViewingRawData &&
    resolvedViewProperties.type === 'check' &&
    giraffeResult.table.getColumnType('_value') === 'number'
  ) {
    setViewRawData(false)
    setDisableRawData(false)
  }

  if (
    isViewingRawData &&
    files &&
    files.length &&
    !isFlagEnabled('simple-table')
  ) {
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

const mdtp = {
  setViewRawData: setIsViewingRawData,
  setDisableRawData: setIsDisabledViewRawData,
}

const connector = connect(mstp, mdtp)

export default connector(
  memo(TimeMachineVis, (prev, next) => isEqual(prev, next))
)
