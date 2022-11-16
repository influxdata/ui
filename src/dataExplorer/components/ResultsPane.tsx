// Libraries
import React, {
  FC,
  lazy,
  Suspense,
  useContext,
  useCallback,
  useState,
} from 'react'
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
  ComponentColor,
} from '@influxdata/clockface'
import {useSelector} from 'react-redux'

// Contexts
import {ResultsContext} from 'src/dataExplorer/components/ResultsContext'
import {QueryContext} from 'src/shared/contexts/query'
import {
  PersistanceContext,
  DEFAULT_FLUX_EDITOR_TEXT,
  DEFAULT_SQL_EDITOR_TEXT,
} from 'src/dataExplorer/context/persistance'

// Components
import Results from 'src/dataExplorer/components/Results'
import {SubmitQueryButton} from 'src/timeMachine/components/SubmitQueryButton'
import QueryTime from 'src/dataExplorer/components/QueryTime'
import NewDatePicker from 'src/shared/components/dateRangePicker/NewDatePicker'
import {SqlEditorMonaco} from 'src/shared/components/SqlMonacoEditor'

// Types
import {TimeRange} from 'src/types'
import {LanguageType} from 'src/dataExplorer/components/resources'

// Utils
import {isOrgIOx} from 'src/organizations/selectors'
import {getRangeVariable} from 'src/variables/utils/getTimeRangeVars'
import {downloadBlob} from 'src/shared/utils/download'
import {event} from 'src/cloud/utils/reporting'
import {notify} from 'src/shared/actions/notifications'
import {bytesFormatter} from 'src/shared/copy/notifications/common'
import {getWindowPeriodVariableFromVariables} from 'src/variables/utils/getWindowVars'

// Constants
import {TIME_RANGE_START, TIME_RANGE_STOP} from 'src/variables/constants'

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

const isDefaultText = text => {
  return text == DEFAULT_FLUX_EDITOR_TEXT || text == DEFAULT_SQL_EDITOR_TEXT
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
    selection,
    resource,
  } = useContext(PersistanceContext)
  const isIoxOrg = useSelector(isOrgIOx)
  const [csvDownloadCancelID, setCancelId] = useState(null)
  const language = resource?.language ?? LanguageType.FLUX

  let submitButtonDisabled = false
  let disabledTitleText = ''
  if (!text || isDefaultText(text)) {
    submitButtonDisabled = true
    disabledTitleText = 'Write a query before running script'
  } else if (language == LanguageType.SQL && !selection.bucket) {
    submitButtonDisabled = true
    disabledTitleText = 'Select a bucket before running script'
  } else if (
    language == LanguageType.FLUX &&
    selection.composition.synced && // using composition
    selection.bucket &&
    !selection.measurement
  ) {
    submitButtonDisabled = true
    disabledTitleText = 'Select a measurement before running script'
  }

  const download = async () => {
    event('CSV Download Initiated')
    const promise = basic(
      text,
      {
        vars: rangeToParam(range),
      },
      {
        rawBlob: true,
        language,
        bucket: selection.bucket,
      }
    )
    setCancelId(promise.id)

    const response = await promise.promise
    if (response.type !== 'SUCCESS') {
      return
    }
    setCancelId(null)
    downloadBlob(response.csv, 'influx.data', '.csv')
    event('CSV size', {size: bytesFormatter(response.bytesRead)})
    event('CSV Download End')
  }

  const submit = useCallback(() => {
    setStatus(RemoteDataState.Loading)
    query(
      text,
      {
        vars: rangeToParam(range),
      },
      {
        language,
        bucket: selection.bucket,
      }
    )
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
  }, [text, range, resource?.language, selection.bucket])

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
                {resource?.language == LanguageType.SQL ? (
                  <SqlEditorMonaco
                    script={text}
                    onChangeScript={setQuery}
                    onSubmitScript={submit}
                  />
                ) : (
                  <FluxMonacoEditor
                    variables={variables}
                    script={text}
                    onChangeScript={setQuery}
                    onSubmitScript={submit}
                  />
                )}
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
              {csvDownloadCancelID == null ? (
                <Button
                  titleText="Download query results as a .CSV file"
                  text="CSV"
                  icon={IconFont.Download_New}
                  onClick={download}
                  status={
                    !submitButtonDisabled
                      ? ComponentStatus.Default
                      : ComponentStatus.Disabled
                  }
                  testID="data-explorer--csv-download"
                />
              ) : (
                <Button
                  text="Cancel"
                  onClick={() => {
                    cancel(csvDownloadCancelID)
                    setCancelId(null)
                  }}
                  color={ComponentColor.Danger}
                />
              )}
              {isIoxOrg && resource?.language === LanguageType.SQL ? null : (
                <NewDatePicker />
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
