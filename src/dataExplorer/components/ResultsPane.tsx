import React, {FC, lazy, Suspense, useState, useContext} from 'react'
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
} from '@influxdata/clockface'

import TimeRangeDropdown from 'src/shared/components/TimeRangeDropdown'
import Results from 'src/dataExplorer/components/Results'
import {ResultsContext} from 'src/dataExplorer/components/ResultsContext'
import {TimeRange} from 'src/types'
import {SubmitQueryButton} from 'src/timeMachine/components/SubmitQueryButton'
import {downloadTextFile} from 'src/shared/utils/download'
import {event} from 'src/cloud/utils/reporting'
import {QueryContext} from 'src/shared/contexts/query'
import {notify} from 'src/shared/actions/notifications'

import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'

const FluxMonacoEditor = lazy(() =>
  import('src/shared/components/FluxMonacoEditor')
)

const INITIAL_HORIZ_RESIZER_HANDLE = 0.2
const fakeNotify = notify

const ResultsPane: FC = () => {
  const [horizDragPosition, setHorizDragPosition] = useState([
    INITIAL_HORIZ_RESIZER_HANDLE,
  ])
  const {basic, query} = useContext(QueryContext)
  const {status, setStatus, setResult} = useContext(ResultsContext)

  const [text, setText] = useState('')
  const [timeRange, setTimeRange] = useState<TimeRange>(DEFAULT_TIME_RANGE)

  const download = () => {
    event('CSV Download Initiated')
    basic(text).promise.then(response => {
      if (response.type !== 'SUCCESS') {
        return
      }

      downloadTextFile(response.csv, 'influx.data', '.csv', 'text/csv')
    })
  }

  const submit = () => {
    setStatus(RemoteDataState.Loading)
    query(text, {
      vars: {
        timeRangeStart: '-1h',
        timeRangeStop: 'now()',
      },
    })
      .then(r => {
        setResult(r)
        setStatus(RemoteDataState.Done)
      })
      .catch(() => {
        setStatus(RemoteDataState.Error)
      })
  }

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
          <div style={{height: '100%', width: '100%', position: 'relative'}}>
            <Suspense
              fallback={
                <SpinnerContainer
                  loading={RemoteDataState.Loading}
                  spinnerComponent={<TechnoSpinner />}
                />
              }
            >
              <FluxMonacoEditor script={text} onChangeScript={setText} />
            </Suspense>
          </div>
          <div style={{width: '100%'}}>
            <FlexBox
              direction={FlexDirection.Row}
              justifyContent={JustifyContent.FlexEnd}
              margin={ComponentSize.Small}
            >
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
                cancelAllRunningQueries={() => {}}
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
