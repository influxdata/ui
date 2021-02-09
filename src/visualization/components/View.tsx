// Libraries
import React, {FC, createElement} from 'react'

import EmptyQueryView, {ErrorFormat} from 'src/shared/components/EmptyQueryView'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import {SUPPORTED_VISUALIZATIONS} from 'src/visualization'
import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'

import ViewLoadingSpinner from 'src/visualization/components/internal/ViewLoadingSpinner'
import {FromFluxResult} from '@influxdata/giraffe'
import {
  ViewProperties,
  RemoteDataState,
  TimeRange,
  TimeZone,
  Theme,
} from 'src/types'

interface Props {
  properties: ViewProperties
  result?: FromFluxResult
  loading: RemoteDataState
  error?: string
  isInitial?: boolean
  timeRange?: TimeRange
  timeZone?: TimeZone
  theme?: Theme
}

const InnerView: FC<Props> = ({
  properties,
  result,
  loading,
  error,
  isInitial,
  timeRange,
  timeZone,
  theme,
}) => {
  if (!SUPPORTED_VISUALIZATIONS[properties.type]?.component) {
    throw new Error('Unknown view type in <View /> ')
  }

  const fallbackNote =
    properties.type !== 'check' && properties['showNoteWhenEmpty']
      ? properties.note
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
        theme: theme || ('dark' as Theme),
        timeZone: timeZone || ('Local' as TimeZone),
      })}
    </EmptyQueryView>
  )
}

const View: FC<Props> = props => (
  <ErrorBoundary>
    <ViewLoadingSpinner loading={props.loading} />
    <InnerView {...props} />
  </ErrorBoundary>
)

export default View
