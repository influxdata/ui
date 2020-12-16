// Libraries
import React, {FC, createElement} from 'react'

import EmptyQueryView, {ErrorFormat} from 'src/shared/components/EmptyQueryView'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import {TYPE_DEFINITIONS} from 'src/visualization'

import ViewLoadingSpinner from 'src/visualization/components/internal/ViewLoadingSpinner'
import {FromFluxResult} from '@influxdata/giraffe'
import {
    ViewProperties,
    RemoteDataState,
    TimeRange,
    TimeZone,
    Theme
} from 'src/types'

interface Props {
    properties: ViewProperties
    result?: FromFluxResult
    loading: RemoteDataState
    error?: string
    isInitial: boolean
    timeRange: TimeRange
    timeZone: TimeZone
    theme: Theme
}
const View: FC<Props> = ({
    properties,
    result,
    loading,
    error,
    isInitial,
    timeRange,
    timeZone,
    theme
}) => {
    const fallbackNote = properties.type !== 'check' && properties['showNoteWhenEmpty'] ? properties.note : null
    const hasResults = !!(result?.table?.length || 0)

    /*
    if (properties.type === 'table') {
      visual = (
        <FluxTablesTransform files={files}>
          {tables => (
            <TableGraphs
              tables={tables}
              properties={properties}
              timeZone={timeZone}
              theme={theme}
            />
          )}
        </FluxTablesTransform>
      )
    } else if (properties.type === 'check') {
      visual = (
        <CheckPlot
          checkType={checkType}
          thresholds={checkThresholds}
          table={giraffeResult.table}
          fluxGroupKeyUnion={giraffeResult.fluxGroupKeyUnion}
          timeZone={timeZone}
          viewProperties={properties}
          statuses={statuses}
        >
          {config => <Plot config={config} />}
        </CheckPlot>
      )
    }
     */

    if (!TYPE_DEFINITIONS[properties.type]?.component) {
      throw new Error('Unknown view type in <View /> ')
    }

    return (
      <ErrorBoundary>
              <ViewLoadingSpinner loading={loading} />
              <EmptyQueryView
                loading={loading}
                errorMessage={error}
                errorFormat={ErrorFormat.Scroll}
                hasResults={hasResults}
                isInitialFetch={isInitial}
                fallbackNote={fallbackNote}
              >
                  {
                      createElement(TYPE_DEFINITIONS[properties.type].component, {
            result: result,
            properties: properties,
            timeRange,
            theme,
            timeZone,
        })
}
              </EmptyQueryView>
      </ErrorBoundary>
    )
}

export default View
