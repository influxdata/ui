// Libraries
import React, {FC, lazy, Suspense, useContext, useCallback} from 'react'
import {
  DraggableResizer,
  Orientation,
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
  IconFont,
  ComponentSize,
  FlexBox,
  FlexDirection,
  JustifyContent,
  AlignItems,
  Icon,
} from '@influxdata/clockface'
import {useSelector, useDispatch} from 'react-redux'

// Contexts
import {ResultsContext} from 'src/dataExplorer/context/results'
import {QueryContext} from 'src/shared/contexts/query'
import {
  PersistenceContext,
  DEFAULT_FLUX_EDITOR_TEXT,
  DEFAULT_SQL_EDITOR_TEXT,
  DEFAULT_INFLUXQL_EDITOR_TEXT,
} from 'src/dataExplorer/context/persistence'

// Components
import {Results} from 'src/dataExplorer/components/Results'
import {SubmitQueryButton} from 'src/timeMachine/components/SubmitQueryButton'
import QueryTime from 'src/dataExplorer/components/QueryTime'
import NewDatePicker from 'src/shared/components/dateRangePicker/NewDatePicker'
import {SqlEditorMonaco} from 'src/shared/components/SqlMonacoEditor'
import {InfluxQLMonacoEditor} from 'src/shared/components/InfluxQLMonacoEditor'
import CSVExportButton from 'src/shared/components/CSVExportButton'

// Types
import {LanguageType} from 'src/dataExplorer/components/resources'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {getRangeVariable} from 'src/variables/utils/getTimeRangeVars'
import {event} from 'src/cloud/utils/reporting'
import {notify} from 'src/shared/actions/notifications'
import {getWindowPeriodVariableFromVariables} from 'src/variables/utils/getWindowVars'
import {csvDownloadFailure} from 'src/shared/copy/notifications'
import {
  sqlAsFlux,
  updateWindowPeriod,
} from 'src/shared/contexts/query/preprocessing'
import {rangeToParam} from 'src/dataExplorer/shared/utils'

// Constants
import {TIME_RANGE_START, TIME_RANGE_STOP} from 'src/variables/constants'
import {API_BASE_PATH} from 'src/shared/constants'

const FluxMonacoEditor = lazy(
  () => import('src/shared/components/FluxMonacoEditor')
)

const fakeNotify = notify

const isDefaultText = (text: string) => {
  return (
    [
      DEFAULT_FLUX_EDITOR_TEXT,
      DEFAULT_SQL_EDITOR_TEXT,
      DEFAULT_INFLUXQL_EDITOR_TEXT,
    ].filter((defaultEditorText: string) => text === defaultEditorText).length >
    0
  )
}

const ResultsPane: FC = () => {
  const {query, cancel} = useContext(QueryContext)
  const {status, result, setStatus, setResult} = useContext(ResultsContext)
  const {
    horizontal,
    setHorizontal,
    query: text,
    setQuery,
    range,
    selection,
    resource,
  } = useContext(PersistenceContext)
  const orgID = useSelector(getOrg)?.id
  const language = resource?.language ?? LanguageType.FLUX
  const dispatch = useDispatch()

  let submitButtonDisabled = false
  let disabledTitleText = ''
  if (!text || isDefaultText(text)) {
    submitButtonDisabled = true
    disabledTitleText = 'Write a query before running script'
  } else if (language === LanguageType.SQL && !selection.bucket) {
    submitButtonDisabled = true
    disabledTitleText = 'Select a bucket before running script'
  } else if (
    language === LanguageType.SQL &&
    selection.composition.synced && // using composition
    selection.bucket &&
    !Boolean(selection.measurement)
  ) {
    submitButtonDisabled = true
    disabledTitleText = 'Select a measurement before running script'
  } else if (language === LanguageType.INFLUXQL && !selection.dbrp) {
    submitButtonDisabled = true
    disabledTitleText =
      'Select a database/retention policy before running script'
  } else if (
    language == LanguageType.FLUX &&
    selection.composition.synced && // using composition
    selection.bucket &&
    !selection.measurement
  ) {
    submitButtonDisabled = true
    disabledTitleText = 'Select a measurement before running script'
  }

  const downloadByServiceWorker = () => {
    if (language === LanguageType.INFLUXQL) {
      try {
        event('runQuery.downloadCSV.influxql', {context: 'query experience'})

        const params = new URLSearchParams({
          db: selection.dbrp?.database,
          q: text,
        })
        if (selection.dbrp?.retention_policy) {
          params.set('rp', selection.dbrp?.retention_policy)
        }
        const url = `${API_BASE_PATH}query?${params}`
        const hiddenForm = document.createElement('form')
        hiddenForm.setAttribute('id', 'downloadDiv')
        hiddenForm.setAttribute('style', 'display: none;')
        hiddenForm.setAttribute('method', 'post')
        hiddenForm.setAttribute('action', url)

        const input = document.createElement('input')
        input.setAttribute('name', 'data')
        input.setAttribute('value', '')
        hiddenForm.appendChild(input)
        document.body.appendChild(hiddenForm)
        hiddenForm.submit()
      } catch (error) {
        dispatch(notify(csvDownloadFailure()))
      }
      return
    }

    try {
      event('runQuery.downloadCSV', {context: 'query experience'})

      const url = `${API_BASE_PATH}api/v2/query?${new URLSearchParams({orgID})}`
      const hiddenForm = document.createElement('form')
      hiddenForm.setAttribute('id', 'downloadDiv')
      hiddenForm.setAttribute('style', 'display: none;')
      hiddenForm.setAttribute('method', 'post')
      hiddenForm.setAttribute('action', url)

      const query =
        language == LanguageType.SQL ? sqlAsFlux(text, selection.bucket) : text
      const extern = updateWindowPeriod(
        query,
        {
          vars: rangeToParam(range),
        },
        'ast'
      )

      const input = document.createElement('input')
      input.setAttribute('name', 'data')
      input.setAttribute(
        'value',
        JSON.stringify({
          query,
          extern,
          dialect: {annotations: ['group', 'datatype', 'default']},
        })
      )
      hiddenForm.appendChild(input)
      document.body.appendChild(hiddenForm)
      hiddenForm.submit()
    } catch (error) {
      dispatch(notify(csvDownloadFailure()))
    }
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
        dbrp: selection.dbrp,
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

  let monacoEditor: JSX.Element = null
  switch (resource?.language) {
    case LanguageType.SQL:
      monacoEditor = (
        <SqlEditorMonaco
          script={text}
          onChangeScript={setQuery}
          onSubmitScript={submit}
        />
      )
      break
    case LanguageType.INFLUXQL:
      monacoEditor = (
        <InfluxQLMonacoEditor
          script={text}
          onChangeScript={setQuery}
          onSubmitScript={submit}
        />
      )
      break
    default:
      // LanguageType.FLUX
      const timeVars = [
        getRangeVariable(TIME_RANGE_START, range),
        getRangeVariable(TIME_RANGE_STOP, range),
      ]
      const variables = timeVars.concat(
        getWindowPeriodVariableFromVariables(text, timeVars) || []
      )
      monacoEditor = (
        <FluxMonacoEditor
          variables={variables}
          script={text}
          onChangeScript={setQuery}
          onSubmitScript={submit}
        />
      )
  }

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
                {monacoEditor}
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
              <CSVExportButton
                disabled={submitButtonDisabled}
                download={downloadByServiceWorker}
              />
              <NewDatePicker />
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

export {ResultsPane}
