// Libraries
import React, {FC, createElement} from 'react'

import './View.scss'

import EmptyQueryView, {ErrorFormat} from 'src/shared/components/EmptyQueryView'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import {SUPPORTED_VISUALIZATIONS} from 'src/visualization'
import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'

import ViewLoadingSpinner from 'src/visualization/components/internal/ViewLoadingSpinner'
import {FromFluxResult} from '@influxdata/giraffe'
import {
  AnnotationsList,
  RemoteDataState,
  TimeRange,
  ViewProperties,
} from 'src/types'

interface Props {
  properties: ViewProperties
  result?: FromFluxResult
  loading?: RemoteDataState
  error?: string
  isInitial?: boolean
  timeRange?: TimeRange
  annotations?: AnnotationsList
  cellID?: string
}

const InnerView: FC<Props> = ({
  properties,
  result,
  loading,
  error,
  isInitial,
  timeRange,
  annotations,
  cellID,
}) => {
  if (!SUPPORTED_VISUALIZATIONS[properties.type]?.component) {
    throw new Error('Unknown view type in <View /> ')
  }

  const fallbackNote =
    properties.type !== 'check' && properties['showNoteWhenEmpty']
      ? properties['note']
      : null
  const hasResults = !!(result?.table?.length || 0)

  return (
    <EmptyQueryView
      loading={loading}
      errorMessage={error}
      errorFormat={ErrorFormat.Scroll}
      hasResults={hasResults}
      isInitialFetch={isInitial || false}
      fallbackNote={fallbackNote}
    >
      {createElement(SUPPORTED_VISUALIZATIONS[properties.type].component, {
        result: result,
        properties: properties,
        timeRange: timeRange || DEFAULT_TIME_RANGE,
        annotations: annotations,
        cellID: cellID,
      })}
    </EmptyQueryView>
  )
}

const QueryStat: FC<Props> = ({result, loading}) => {
  let tableNum = 0

  const tableColumn = result?.table?.getColumn('table')

  const lastTableValue = tableColumn[tableColumn.length - 1]

  if (typeof lastTableValue === 'string') {
    tableNum = parseInt(lastTableValue) + 1
  } else if (typeof lastTableValue === 'boolean') {
    tableNum = lastTableValue ? 1 : 0
  } else {
    // number
    tableNum = lastTableValue + 1
  }

  const queryStat = {
    tableNum,
    rowNum: result?.table?.length || 0,
    processTime: 2, // ms TODO
  }

  if (loading !== RemoteDataState.Done) {
    return null
  }

  return (
    <div className="query-stat">
      <span className="query-stat--bold">{`${queryStat.tableNum} tables`}</span>
      <span className="query-stat--bold">{`${queryStat.rowNum} rows`}</span>
      <span className="query-stat--normal">{`${queryStat.processTime} ms`}</span>
    </div>
  )
}
const View: FC<Props> = props => (
  <ErrorBoundary>
    <ViewLoadingSpinner loading={props.loading || RemoteDataState.Done} />
    <QueryStat
      loading={props.loading || RemoteDataState.Done}
      result={props.result}
      {...props}
    />
    <InnerView {...props} />
  </ErrorBoundary>
)

export default View
