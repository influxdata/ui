// Libraries
import React, {
  FC,
  useContext,
  useCallback,
  useMemo,
  useState,
  lazy,
  Suspense,
  useEffect,
} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {parse} from 'src/languageSupport/languages/flux/lspUtils'
import {
  ComponentStatus,
  Form,
  FlexBox,
  Input,
  InputType,
  Icon,
  IconFont,
  ComponentSize,
  Panel,
  AlignItems,
  JustifyContent,
  List,
  ComponentColor,
  Button,
  InfluxColors,
  TechnoSpinner,
  SpinnerContainer,
} from '@influxdata/clockface'
import {PipeContext} from 'src/flows/context/pipe'
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {remove} from 'src/shared/contexts/query'
import Expressions from 'src/flows/pipes/Notification/Expressions'
import Measurement from 'src/flows/pipes/Notification/Measurement'
import Threshold from 'src/flows/pipes/Notification/Threshold'
import {
  ENDPOINT_DEFINITIONS,
  ENDPOINT_ORDER,
} from 'src/flows/pipes/Notification/endpoints'
import {SidebarContext} from 'src/flows/context/sidebar'
import ExportTask from 'src/flows/pipes/Notification/ExportTask'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
const NotificationMonacoEditor = lazy(
  () => import('src/flows/pipes/Notification/NotificationMonacoEditor')
)

// Types
import {RemoteDataState, EditorType} from 'src/types'
import {PipeProp} from 'src/types/flows'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {notify} from 'src/shared/actions/notifications'
import {
  testNotificationSuccess,
  testNotificationFailure,
} from 'src/shared/copy/notifications'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {getSecrets} from 'src/secrets/actions/thunks'
import {getAllSecrets} from 'src/resources/selectors'

// Styles
import 'src/flows/pipes/Notification/styles.scss'

// Constants
import {UNPROCESSED_PANEL_TEXT} from 'src/flows'
import CreateSecretForm from 'src/secrets/components/CreateSecret/CreateSecretForm'

const Notification: FC<PipeProp> = ({Context}) => {
  const dispatch = useDispatch()
  const {id, data, update, results, loading} = useContext(PipeContext)
  const {query, simplify, getPanelQueries} = useContext(FlowQueryContext)
  const {hideSub, id: showId, show, showSub} = useContext(SidebarContext)
  const [status, setStatus] = useState<RemoteDataState>(
    RemoteDataState.NotStarted
  )
  const [editorInstance, setEditorInstance] = useState<EditorType>(null)

  let intervalError = ''
  let offsetError = ''

  useEffect(() => {
    dispatch(getSecrets())
  }, [])

  const createSecret = (callback: (id: string) => void) => {
    if (showId !== id) {
      show(id)
      showSub(<CreateSecretForm onDismiss={hideSub} onSubmit={callback} />)
    }
  }

  const secrets = useSelector(getAllSecrets)

  if (!data.interval) {
    intervalError = 'Required'
  } else if (
    data.interval !==
    data.interval.match(/(?:(\d+(ns|us|µs|ms|s|m|h|d|w|mo|y){1}))/g)?.join('')
  ) {
    intervalError = 'Invalid Time'
  }

  if (
    data.offset &&
    data.offset !==
      data.offset.match(/(?:(\d+(ns|us|µs|ms|s|m|h|d|w|mo|y){1}))/g)?.join('')
  ) {
    offsetError = 'Invalid Time'
  }

  const loadingText = useMemo(() => {
    if (loading === RemoteDataState.Loading) {
      return 'Loading'
    }

    if (loading === RemoteDataState.NotStarted) {
      return UNPROCESSED_PANEL_TEXT
    }

    return 'No Data Returned'
  }, [loading])

  const queryText = getPanelQueries(id)?.source
  const hasTaskOption = useMemo(
    () =>
      !!Object.keys(
        remove(
          parse(simplify(queryText)),
          node =>
            node.type === 'OptionStatement' &&
            node.assignment.id.name === 'task'
        ).reduce((acc, curr) => {
          // eslint-disable-next-line no-extra-semi
          ;(curr.assignment?.init?.properties || []).reduce((_acc, _curr) => {
            if (_curr.key?.name && _curr.value?.location?.source) {
              _acc[_curr.key.name] = _curr.value.location.source
            }

            return _acc
          }, acc)

          return acc
        }, {})
      ).length,
    [queryText]
  )

  const numericColumns = (results?.parsed?.table?.columnKeys || []).filter(
    key => {
      if (key === 'result' || key === 'table') {
        return false
      }

      const columnType = results.parsed.table.getColumnType(key)

      return columnType === 'time' || columnType === 'number'
    }
  )

  const updateMessage = text => {
    update({
      message: text,
    })
  }

  const updateInterval = evt => {
    update({
      interval: evt.target.value,
    })
  }

  const updateOffset = evt => {
    update({
      offset: evt.target.value,
    })
  }

  const updateEndpoint = which => {
    event('Changed Notification Endpoint', {which})

    update({
      endpoint: which,
      endpointData: ENDPOINT_DEFINITIONS[which].data,
    })
  }

  const inject = useCallback(
    (exp: string): void => {
      if (!editorInstance) {
        return
      }
      const p = editorInstance.getPosition()
      const edits = [
        {
          range: new monaco.Range(
            p.lineNumber,
            p.column,
            p.lineNumber,
            p.column
          ),
          text: ` \$\{r.${exp}\} `,
        },
      ]

      editorInstance.executeEdits('', edits)
      updateMessage(editorInstance.getValue())
      event('Injecting Expression into Alert Message')
    },
    [editorInstance]
  )

  const warningMessage = useMemo(() => {
    if (!hasTaskOption) {
      return
    }

    return (
      <div className="flow-error">
        <div className="flow-error--header">
          <Icon
            glyph={IconFont.AlertTriangle}
            className="flow-error--vis-toggle"
          />
        </div>
        <div className="flow-error--body">
          <h1>The task option is reserved</h1>
          <p>
            This panel will take precedence over any task configuration and
            overwrite the option. Remove it from your source query to remove
            this message
          </p>
        </div>
      </div>
    )
  }, [hasTaskOption])

  const avail = Object.keys(ENDPOINT_DEFINITIONS)
    .filter(
      k =>
        // show endpoints without feature flags or that have their flags enabled
        !ENDPOINT_DEFINITIONS[k].featureFlag ||
        isFlagEnabled(ENDPOINT_DEFINITIONS[k].featureFlag)
    )
    .sort((a, b) => ENDPOINT_ORDER.indexOf(a) - ENDPOINT_ORDER.indexOf(b))
    .map(k => (
      <List.Item
        key={k}
        id={k}
        testID={`dropdown-item--${k}`}
        onClick={() => updateEndpoint(k)}
        selected={data.endpoint === k}
      >
        {ENDPOINT_DEFINITIONS[k].name}
      </List.Item>
    ))

  const handleTestEndpoint = async () => {
    event('Alert Panel (Notebooks) - Test Endpoint Clicked')

    const queryText = `
      import "strings"
      import "regexp"
      import "influxdata/influxdb/schema"
      import "influxdata/influxdb/secrets"
      import "experimental"
      ${ENDPOINT_DEFINITIONS[data.endpoint]?.generateTestImports()}

      ${ENDPOINT_DEFINITIONS[data.endpoint]?.generateTestQuery(
        data.endpointData
      )}
    `

    try {
      setStatus(RemoteDataState.Loading)
      await query(queryText)

      setStatus(RemoteDataState.Done)
      dispatch(notify(testNotificationSuccess(data.endpoint)))
    } catch (e) {
      setStatus(RemoteDataState.Error)
      dispatch(notify(testNotificationFailure(e.message)))
    }
  }

  const launcher = () => {
    if (showId === id) {
      hideSub()
    } else {
      event('Opening the Expressions Sidebar')
      show(id)
      showSub(<Expressions parsed={results?.parsed} onSelect={inject} />)
    }
  }

  if (
    (loading === RemoteDataState.NotStarted ||
      loading === RemoteDataState.Loading) &&
    !numericColumns.length
  ) {
    return (
      <Context>
        <div className="panel-resizer">
          <div className="panel-resizer--header">
            <Icon glyph={IconFont.Bell} className="panel-resizer--vis-toggle" />
          </div>
          <div className="panel-resizer--body">
            <div className="panel-resizer--empty">{loadingText}</div>
          </div>
        </div>
        {warningMessage}
      </Context>
    )
  }

  if (!numericColumns.length) {
    return (
      <Context>
        <div className="panel-resizer">
          <div className="panel-resizer--header">
            <Icon glyph={IconFont.Bell} className="panel-resizer--vis-toggle" />
          </div>
          <div className="panel-resizer--body">
            <div className="panel-resizer--empty">
              This cell requires a numeric column. Check your source query
            </div>
          </div>
        </div>
        {warningMessage}
      </Context>
    )
  }

  return (
    <Context>
      <div className="notification">
        {loading === RemoteDataState.Loading && (
          <TechnoSpinner
            style={{width: 25, height: 25, position: 'absolute', right: 15}}
          />
        )}
        <Measurement />
        <Threshold />
        <FlexBox margin={ComponentSize.Medium} style={{padding: '24px 0'}}>
          <FlexBox.Child grow={1} shrink={1}>
            <Form.Element
              label="Check Every"
              required={true}
              errorMessage={intervalError}
              style={{paddingBottom: '4px'}}
            >
              <Input
                name="interval"
                type={InputType.Text}
                placeholder="ex: 3h30s"
                value={data.interval}
                onChange={updateInterval}
                status={
                  intervalError
                    ? ComponentStatus.Error
                    : ComponentStatus.Default
                }
                size={ComponentSize.Medium}
              />
            </Form.Element>
          </FlexBox.Child>

          <FlexBox.Child grow={1} shrink={1}>
            <Form.Element
              label="Query Offset"
              required={true}
              errorMessage={offsetError}
            >
              <Input
                name="interval"
                type={InputType.Text}
                placeholder="ex: 3h30s"
                value={data.offset}
                onChange={updateOffset}
                status={
                  offsetError ? ComponentStatus.Error : ComponentStatus.Default
                }
                size={ComponentSize.Medium}
              />
            </Form.Element>
          </FlexBox.Child>
        </FlexBox>
        <FlexBox alignItems={AlignItems.Stretch} margin={ComponentSize.Medium}>
          <FlexBox.Child>
            <Form.Element label="Notification" required={true}>
              <Panel backgroundColor={InfluxColors.Grey15}>
                <Panel.Body>
                  <FlexBox
                    justifyContent={JustifyContent.FlexEnd}
                    alignItems={AlignItems.FlexEnd}
                    margin={ComponentSize.Medium}
                  >
                    <FlexBox.Child grow={0} shrink={0}>
                      <Button
                        text="${exp}"
                        onClick={launcher}
                        color={ComponentColor.Secondary}
                        testID="notification-exp-button"
                        status={
                          editorInstance
                            ? ComponentStatus.Default
                            : ComponentStatus.Loading
                        }
                      />
                    </FlexBox.Child>
                    <FlexBox.Child grow={0} shrink={0}>
                      <Button
                        text="Test Endpoint"
                        status={
                          status === RemoteDataState.Loading
                            ? ComponentStatus.Loading
                            : ComponentStatus.Default
                        }
                        onClick={handleTestEndpoint}
                        color={ComponentColor.Primary}
                      />
                    </FlexBox.Child>
                  </FlexBox>
                  <FlexBox
                    alignItems={AlignItems.Stretch}
                    margin={ComponentSize.Medium}
                  >
                    <Form.Element
                      required={true}
                      label="Endpoint"
                      className="endpoint-list--element"
                    >
                      <List>{avail}</List>
                    </Form.Element>
                    <FlexBox.Child grow={1} shrink={1}>
                      <Form.Element
                        label="Details"
                        className="endpoint-details--element"
                      >
                        {React.createElement(
                          ENDPOINT_DEFINITIONS[data.endpoint].component,
                          {
                            createSecret,
                            secrets: secrets.sort((a, b) =>
                              a.id.localeCompare(b.id)
                            ),
                          }
                        )}
                      </Form.Element>
                    </FlexBox.Child>
                    <FlexBox.Child grow={1} shrink={1}>
                      <Form.Element label="Message Format" required={true}>
                        <div
                          className="markdown-editor--monaco"
                          data-testid="notification-message--monaco-editor"
                        >
                          <Suspense
                            fallback={
                              <SpinnerContainer
                                loading={RemoteDataState.Loading}
                                spinnerComponent={<TechnoSpinner />}
                              />
                            }
                          >
                            <NotificationMonacoEditor
                              text={data.message}
                              onChangeText={updateMessage}
                              setEditorInstance={setEditorInstance}
                            />
                          </Suspense>
                        </div>
                      </Form.Element>
                    </FlexBox.Child>
                  </FlexBox>
                </Panel.Body>
              </Panel>
            </Form.Element>
          </FlexBox.Child>
        </FlexBox>
        <Panel.Footer justifyContent={JustifyContent.FlexEnd}>
          <FlexBox margin={ComponentSize.Medium}>
            <ErrorBoundary>
              <ExportTask />
            </ErrorBoundary>
          </FlexBox>
        </Panel.Footer>
      </div>
      {warningMessage}
    </Context>
  )
}

export default Notification
