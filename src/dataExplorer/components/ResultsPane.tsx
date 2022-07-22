// Libraries
import React, {FC, lazy, Suspense, useContext} from 'react'
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
} from '@influxdata/clockface'

// Contexts
import {ResultsContext} from 'src/dataExplorer/components/ResultsContext'
import {QueryContext} from 'src/shared/contexts/query'

// Components
import TimeRangeDropdown from 'src/shared/components/TimeRangeDropdown'
import Results from 'src/dataExplorer/components/Results'
import {SubmitQueryButton} from 'src/timeMachine/components/SubmitQueryButton'
import QueryTime from 'src/dataExplorer/components/QueryTime'

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
import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {useSessionStorage} from '../shared/utils'

const FluxMonacoEditor = lazy(() =>
  import('src/shared/components/FluxMonacoEditor')
)

const fakeNotify = notify

const rangeToParam = (timeRange: TimeRange) => {
  let timeRangeStart, timeRangeStop

  if (!timeRange) {
    timeRangeStart = timeRangeStop = null
  } else {
    if (timeRange.type === 'selectable-duration') {
      timeRangeStart = '-' + timeRange.duration
    } else if (timeRange.type === 'duration') {
      timeRangeStart = '-' + timeRange.lower
    } else if (isNaN(Date.parse(timeRange.lower))) {
      timeRangeStart = null
    } else {
      timeRangeStart = new Date(timeRange.lower).toISOString()
    }

    if (!timeRange.upper) {
      timeRangeStop = 'now()'
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
  const {status, setStatus, setResult} = useContext(ResultsContext)

  const [
    horizDragPosition,
    setHorizDragPosition,
  ] = useSessionStorage('dataExplorer.resize.horizontal', [0.2])
  const [text, setText] = useSessionStorage('dataExplorer.query', '')
  const [timeRange, setTimeRange] = useSessionStorage(
    'dataExplorer.range',
    DEFAULT_TIME_RANGE
  )

  const download = () => {
    event('CSV Download Initiated')
    basic(text, {
      vars: rangeToParam(timeRange),
    }).promise.then(response => {
      if (response.type !== 'SUCCESS') {
        return
      }

      downloadTextFile(response.csv, 'influx.data', '.csv', 'text/csv')
    })
  }

  const submit = () => {
    setStatus(RemoteDataState.Loading)
    query(text, {
      vars: rangeToParam(timeRange),
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
        })
        event('resultReceived', {status: 'error'})
        setStatus(RemoteDataState.Error)
      })
  }

  const timeVars = [
    getRangeVariable(TIME_RANGE_START, timeRange),
    getRangeVariable(TIME_RANGE_STOP, timeRange),
  ]

  const variables = timeVars.concat(
    getWindowPeriodVariableFromVariables(text, timeVars) || []
  )

  return (
    <DraggableResizer
      handleOrientation={Orientation.Horizontal}
      handlePositions={horizDragPosition}
      onChangePositions={setHorizDragPosition}
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
                  onChangeScript={setText}
                />
              </Suspense>
            </div>
          </div>
          <div style={{width: '100%'}}>
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
              <TimeRangeDropdown
                timeRange={timeRange}
                onSetTimeRange={(range: TimeRange) => setTimeRange(range)}
              />
              <SubmitQueryButton
                className="submit-btn"
                text="Run"
                icon={IconFont.Play}
                submitButtonDisabled={!text}
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
