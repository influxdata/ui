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
import {QueryContext, handleQueryResponse} from 'src/shared/contexts/query'
import {
  PersistanceContext,
  DEFAULT_FLUX_EDITOR_TEXT,
  DEFAULT_SQL_EDITOR_TEXT,
  DEFAULT_INFLUXQL_EDITOR_TEXT,
} from 'src/dataExplorer/context/persistance'

// Components
import Results from 'src/dataExplorer/components/Results'
import {SubmitQueryButton} from 'src/timeMachine/components/SubmitQueryButton'
import QueryTime from 'src/dataExplorer/components/QueryTime'
import NewDatePicker from 'src/shared/components/dateRangePicker/NewDatePicker'
import {SqlEditorMonaco} from 'src/shared/components/SqlMonacoEditor'
import {InfluxQLMonacoEditor} from 'src/shared/components/InfluxQLMonacoEditor'
import CSVExportButton from 'src/shared/components/CSVExportButton'

// Types
import {LanguageType} from 'src/dataExplorer/components/resources'
import {CancellationError} from 'src/types'
import {FluxResult} from 'src/types/flows'
import {RunQueryResult} from 'src/shared/apis/query'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {getRangeVariable} from 'src/variables/utils/getTimeRangeVars'
import {event} from 'src/cloud/utils/reporting'
import {notify} from 'src/shared/actions/notifications'
import {getWindowPeriodVariableFromVariables} from 'src/variables/utils/getWindowVars'
import {csvDownloadFailure, resultTooLarge} from 'src/shared/copy/notifications'
import {
  sqlAsFlux,
  updateWindowPeriod,
} from 'src/shared/contexts/query/preprocessing'
import {rangeToParam} from 'src/dataExplorer/shared/utils'
import {getFlagValue} from 'src/shared/utils/featureFlag'
import {trimPartialLines} from 'src/shared/contexts/query/postprocessing'

// Constants
import {TIME_RANGE_START, TIME_RANGE_STOP} from 'src/variables/constants'
import {API_BASE_PATH, FLUX_RESPONSE_BYTES_LIMIT} from 'src/shared/constants'
import {fromFlux} from '@influxdata/giraffe'

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
  } = useContext(PersistanceContext)
  const orgID = useSelector(getOrg)?.id
  const language = resource?.language ?? LanguageType.FLUX
  const dispatch = useDispatch()

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

  const downloadByServiceWorker = () => {
    // TODO chunchun:
    //   temporarily using v1 endpoint for InfluxQL which only works for TSM,
    //   replace it with v2 endpint once the InfluxQL bridge is ready on IOx
    if (language === LanguageType.INFLUXQL) {
      console.error('csv download for InfluxQL is not implemented')
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

    // TODO chunchun:
    //   temporarily using v1 endpoint for InfluxQL which only works for TSM,
    //   replace it with v2 endpint once the InfluxQL bridge is ready on IOx
    if (language === LanguageType.INFLUXQL) {
      const handleUiParsing = async response => {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        let csv = ''
        let bytesRead = 0
        let didTruncate = false
        let read = await reader.read()

        const dataExplorerCsvLimit: string | boolean = getFlagValue(
          'dataExplorerCsvLimit'
        )
        const BYTE_LIMIT: number = Boolean(dataExplorerCsvLimit)
          ? Number(dataExplorerCsvLimit)
          : FLUX_RESPONSE_BYTES_LIMIT

        while (!read.done) {
          const text = decoder.decode(read.value)

          bytesRead += read.value.byteLength

          if (bytesRead > BYTE_LIMIT) {
            csv += trimPartialLines(text)
            didTruncate = true
            break
          } else {
            csv += text
            read = await reader.read()
          }
        }

        reader.cancel()

        return {
          type: 'SUCCESS',
          csv,
          bytesRead,
          didTruncate,
        }
      }

      try {
        // Reference:
        //  https://docs.influxdata.com/influxdb/cloud/api/v1-compatibility/#tag/Query
        const params: URLSearchParams = new URLSearchParams({
          orgID,
          db: selection?.dbrp.database,
          q: text,
        })
        if (selection?.dbrp.retention_policy) {
          params.set('rp', selection?.dbrp.retention_policy)
        }
        const url = `${API_BASE_PATH}query?${params}`

        const headers = {
          'Content-Type': 'application/vnd.influxql',
          'Accept-Encoding': 'gzip',
        }
        headers['Accept'] = 'text/csv'
        // TODO chunchun: auth token?
        headers['Authorization'] =
          'Token 3WpeBwZlkO1FKZKuJU_wcegslvtzSH_sVz5Ux6dUzEslohc4PaucMnKp0bbFbbTIcm-7LC0HmWptv7XdVg53mg=='

        const controller = new AbortController()

        fetch(url, {
          method: 'POST',
          headers,
          signal: controller.signal,
        })
          .then((resp: Response): Promise<RunQueryResult> => {
            return handleQueryResponse(resp, handleUiParsing)
          })
          .then((resp): Promise<FluxResult> => {
            if (resp.type !== 'SUCCESS') {
              throw new Error(resp.message)
            }
            if (resp.didTruncate) {
              dispatch(notify(resultTooLarge(resp.bytesRead)))
            }
            const parsed = fromFlux(resp.csv)

            return Promise.resolve({
              source: text,
              parsed,
              error: null,
              truncated: resp.didTruncate,
              bytes: resp.bytesRead,
            } as FluxResult)
          })
          .then(resp => {
            event('resultReceived', {
              status: resp.parsed.table.length === 0 ? 'empty' : 'good',
            })
            setResult(resp)
            setStatus(RemoteDataState.Done)
          })
          .catch(error => {
            if (error.name === 'AbortError') {
              return Promise.reject(new CancellationError())
            }
            return Promise.reject(error)
          })
      } catch (error) {
        setResult({
          source: text,
          parsed: null,
          error: error.message,
          truncated: false,
          bytes: 0,
        })
        event('resultReceived', {status: 'error'})
        setStatus(RemoteDataState.Error)
      }

      return
    }

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
