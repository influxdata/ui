// Libraries
import React, {FC, createElement} from 'react'

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
  annotations?: AnnotationsList
  cellID?: string
  error?: string
  hideTimer?: boolean
  isInitial?: boolean
  loading?: RemoteDataState
  result?: FromFluxResult
  timeRange?: TimeRange
  transmitWindowPeriod?: (windowPeriod: number | string) => void
}

const InnerView: FC<Props> = ({
  properties,
  annotations,
  cellID,
  error,
  isInitial,
  loading,
  result,
  timeRange,
  transmitWindowPeriod,
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
        annotations: annotations,
        cellID: cellID,
        properties: properties,
        result: result,
        timeRange: timeRange || DEFAULT_TIME_RANGE,
        transmitWindowPeriod: transmitWindowPeriod || (() => {}),
      })}
    </EmptyQueryView>
  )
}

const View: FC<Props> = props => (
  <ErrorBoundary>
    {!props.hideTimer && (
      <ViewLoadingSpinner loading={props.loading || RemoteDataState.Done} />
    )}
    <InnerView {...props} />
  </ErrorBoundary>
)

export default View
