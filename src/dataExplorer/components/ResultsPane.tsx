// Libraries
import React, {FC, lazy, Suspense, useContext, useCallback} from 'react'
import {
  DraggableResizer,
  Orientation,
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
  Button,
  IconFont,
  ComponentStatus,
  ComponentSize,
  FlexBox,
  FlexDirection,
  JustifyContent,
  AlignItems,
  Icon,
} from '@influxdata/clockface'

// Contexts
import {ResultsContext} from 'src/dataExplorer/components/ResultsContext'
import {QueryContext} from 'src/shared/contexts/query'
import {PersistanceContext} from 'src/dataExplorer/context/persistance'

// Components
import TimeRangeDropdown from 'src/shared/components/TimeRangeDropdown'
import Results from 'src/dataExplorer/components/Results'
import {SubmitQueryButton} from 'src/timeMachine/components/SubmitQueryButton'
import QueryTime from 'src/dataExplorer/components/QueryTime'
import NewDatePicker from 'src/shared/components/dateRangePicker/NewDatePicker'

// Types
import {TimeRange} from 'src/types'

// Utils
import {getRangeVariable} from 'src/variables/utils/getTimeRangeVars'
import {downloadTextFile} from 'src/shared/utils/download'
import {event} from 'src/cloud/utils/reporting'
import {notify} from 'src/shared/actions/notifications'
import {getWindowPeriodVariableFromVariables} from 'src/variables/utils/getWindowVars'

// Constants
import {TIME_RANGE_START, TIME_RANGE_STOP} from 'src/variables/constants'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

const FluxMonacoEditor = lazy(
  () => import('src/shared/components/FluxMonacoEditor')
)

const fakeNotify = notify

const rangeToParam = (timeRange: TimeRange) => {
  let timeRangeStart: string, timeRangeStop: string
  const durationRegExp = /([0-9]+)(y|mo|w|d|h|ms|s|m|us|µs|ns)$/g

  if (!timeRange) {
    timeRangeStart = timeRangeStop = null
  } else {
    if (timeRange.type === 'selectable-duration') {
      timeRangeStart = '-' + timeRange.duration
    } else if (timeRange.type === 'duration') {
      timeRangeStart = '-' + timeRange.lower
    } else if (!isNaN(Number(timeRange.lower)) || timeRange.lower === 'now()') {
      timeRangeStart = timeRange.lower
    } else if (!!timeRange?.lower?.match(durationRegExp)) {
      timeRangeStart = timeRange.lower
    } else if (isNaN(Date.parse(timeRange.lower))) {
      timeRangeStart = null
    } else {
      timeRangeStart = new Date(timeRange.lower).toISOString()
    }

    if (!timeRange.upper) {
      timeRangeStop = 'now()'
    } else if (!isNaN(Number(timeRange.upper)) || timeRange.upper === 'now()') {
      timeRangeStop = timeRange.upper
    } else if (!!timeRange?.upper?.match(durationRegExp)) {
      timeRangeStop = timeRange.upper
    } else if (isNaN(Date.parse(timeRange.upper))) {
      timeRangeStop = null
    } else {
      timeRangeStop = new Date(timeRange.upper).toISOString()
    }
  }

  return {
    timeRangeStart,
    timeRangeStop,
  }
}

const ResultsPane: FC = () => {
  const {basic, query, cancel} = useContext(QueryContext)
  const {status, result, setStatus, setResult} = useContext(ResultsContext)
  const {
    horizontal,
    setHorizontal,
    query: text,
    setQuery,
    range,
    setRange,
    selection,
  } = useContext(PersistanceContext)

  const submitButtonDisabled = !text && !selection.measurement

  const disabledTitleText = submitButtonDisabled
    ? 'Select measurement before running script'
    : ''

  const download = () => {
    event('CSV Download Initiated')
    basic(text, {
      vars: rangeToParam(range),
    }).promise.then(response => {
      if (response.type !== 'SUCCESS') {
        return
      }

      downloadTextFile(response.csv, 'influx.data', '.csv', 'text/csv')
    })
  }

  const submit = useCallback(() => {
    setStatus(RemoteDataState.Loading)
    query(text, {
      vars: rangeToParam(range),
    })
      .then(r => {
        event('resultReceived', {
          status: r.parsed.table.length === 0 ? 'empty' : 'good',
        })
        setResult(r)
        setStatus(RemoteDataState.Done)
      })
      .catch(e => {
        setResult({
          source: text,
          parsed: null,
          error: e.message,
          truncated: false,
          bytes: 0,
        })
        event('resultReceived', {status: 'error'})
        setStatus(RemoteDataState.Error)
      })
  }, [text, range])

  const timeVars = [
    getRangeVariable(TIME_RANGE_START, range),
    getRangeVariable(TIME_RANGE_STOP, range),
  ]

  const variables = timeVars.concat(
    getWindowPeriodVariableFromVariables(text, timeVars) || []
  )

  return (
    <DraggableResizer
      handleOrientation={Orientation.Horizontal}
      handlePositions={horizontal}
      onChangePositions={setHorizontal}
    >
      <DraggableResizer.Panel>
        <FlexBox
          direction={FlexDirection.Column}
          justifyContent={JustifyContent.FlexEnd}
          margin={ComponentSize.Small}
          style={{height: '100%'}}
        >
          <div className="data-explorer--monaco-outer">
            <div className="data-explorer--monaco-wrap">
              <Suspense
                fallback={
                  <SpinnerContainer
                    loading={RemoteDataState.Loading}
                    spinnerComponent={<TechnoSpinner />}
                  />
                }
              >
                <FluxMonacoEditor
                  variables={variables}
                  script={text}
                  onChangeScript={setQuery}
                  onSubmitScript={submit}
                />
              </Suspense>
            </div>
          </div>
          {status === RemoteDataState.Error && (
            <div className="data-explorer--error-gutter">
              <Icon glyph={IconFont.AlertTriangle} />
              <pre>{result.error}</pre>
            </div>
          )}
          <div className="data-explorer--control">
            <FlexBox
              direction={FlexDirection.Row}
              justifyContent={JustifyContent.FlexEnd}
              alignItems={AlignItems.FlexStart}
              margin={ComponentSize.Small}
            >
              <QueryTime />
              <Button
                titleText="Download query results as a .CSV file"
                text="CSV"
                icon={IconFont.Download_New}
                onClick={download}
                status={
                  text ? ComponentStatus.Default : ComponentStatus.Disabled
                }
              />
              {isFlagEnabled('newTimeRangeComponent') ? (
                <NewDatePicker />
              ) : (
                <TimeRangeDropdown
                  timeRange={range}
                  onSetTimeRange={(range: TimeRange) => setRange(range)}
                />
              )}
              <SubmitQueryButton
                className="submit-btn"
                text="Run"
                icon={IconFont.Play}
                submitButtonDisabled={submitButtonDisabled}
                disabledTitleText={disabledTitleText}
                queryStatus={status}
                onSubmit={submit}
                onNotify={fakeNotify}
                queryID=""
                cancelAllRunningQueries={() => {
                  cancel()
                }}
              />
            </FlexBox>
          </div>
        </FlexBox>
      </DraggableResizer.Panel>
      <DraggableResizer.Panel>
        <Results />
      </DraggableResizer.Panel>
    </DraggableResizer>
  )
}

export default ResultsPane
