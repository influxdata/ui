// Libraries
import React, {FC, memo} from 'react'
import {connect, ConnectedProps, useDispatch} from 'react-redux'
import classnames from 'classnames'
import {createGroupIDColumn, fromFlux} from '@influxdata/giraffe'
import {isEqual} from 'lodash'

// Components
import {View} from 'src/visualization'
import {SimpleTableViewProperties} from 'src/visualization/types/SimpleTable'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import EmptyQueryView, {ErrorFormat} from 'src/shared/components/EmptyQueryView'
import SimpleTable from 'src/visualization/types/SimpleTable/view'

// Utils
import {
  getActiveCellID,
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
import {RemoteDataState, AppState, ViewProperties, XYViewProperties} from 'src/types'

// Selectors
import {getActiveTimeRange} from 'src/timeMachine/selectors/index'
import {makeColorMappingFromColors} from '../../visualization/utils/colorMapping'
import {setViewProperties} from '../actions'

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
  cellID,
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

  const groupKey = [...giraffeResult.fluxGroupKeyUnion, 'result']
  const [, fillColumnMap] = createGroupIDColumn(giraffeResult.table, groupKey)

  const colorMapping = makeColorMappingFromColors(fillColumnMap, viewProperties as XYViewProperties)

  console.log("UPDATE ----- REEEEEEE", {colorMapping})

  const dispatch = useDispatch()
  if (loading === 'Done'){
    dispatch(setViewProperties({...viewProperties, colorMapping} as XYViewProperties))
  }

  const simpleTableProperties = {
    type: 'simple-table',
    showAll: true,
  } as SimpleTableViewProperties

  if (isViewingRawData) {
    resolvedViewProperties = {
      type: 'simple-table',
      showAll: true,
    } as SimpleTableViewProperties
  }
  const noQueries =
    loading === RemoteDataState.NotStarted || !viewProperties.queries.length
  const timeMachineViewClassName = classnames('time-machine--view', {
    'time-machine--view__empty': noQueries,
  })

  const viewRawData =
    isViewingRawData ||
    (type === 'check' &&
      giraffeResult.table.getColumnType('_value') !== 'number' &&
      !!giraffeResult.table.length)

  // Handles deadman check edge case to allow non-numeric values
  if (viewRawData && files && files?.length) {
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
            <SimpleTable
              result={parsedResults}
              properties={simpleTableProperties}
            />
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
        cellID={cellID}
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
  const cellID = getActiveCellID(state)

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
    cellID,
  }
}

const connector = connect(mstp)

export default connector(
  memo(TimeMachineVis, (prev, next) => isEqual(prev, next))
)
