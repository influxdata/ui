// Libraries
import React, {FC, useContext, useMemo, lazy, Suspense} from 'react'
import {parse} from '@influxdata/flux'
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
  Dropdown,
  InfluxColors,
  TechnoSpinner,
  SpinnerContainer,
} from '@influxdata/clockface'
import Threshold from 'src/flows/pipes/Notification/Threshold'

import {PipeContext} from 'src/flows/context/pipe'
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {remove} from 'src/shared/contexts/query'
import {DEFAULT_ENDPOINTS} from 'src/flows/pipes/Notification/Endpoints'
const NotificationMonacoEditor = lazy(() =>
  import('src/flows/pipes/Notification/NotificationMonacoEditor')
)

// Types
import {RemoteDataState} from 'src/types'
import {PipeProp} from 'src/types/flows'

// Styles
import 'src/flows/pipes/Notification/styles.scss'

const ReadOnly: FC<PipeProp> = ({Context}) => {
  const {id, data, results, loading} = useContext(PipeContext)
  const {simplify, getPanelQueries} = useContext(FlowQueryContext)
  let intervalError = ''
  let offsetError = ''

  if (!data.interval) {
    intervalError = 'Required'
  } else if (
    data.interval !==
    data.interval.match(/(?:(\d+(y|mo|s|m|w|h){1}))/g)?.join('')
  ) {
    intervalError = 'Invalid Time'
  }

  if (
    data.offset &&
    data.offset !== data.offset.match(/(?:(\d+(y|mo|s|m|w|h){1}))/g)?.join('')
  ) {
    offsetError = 'Invalid Time'
  }

  const loadingText = useMemo(() => {
    if (loading === RemoteDataState.Loading) {
      return 'Loading'
    }

    if (loading === RemoteDataState.NotStarted) {
      return 'This cell will display results from the previous cell'
    }

    return 'No Data Returned'
  }, [loading])

  const queryText = getPanelQueries(id, true)?.source
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

  if (
    loading === RemoteDataState.NotStarted ||
    loading === RemoteDataState.Loading
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
        <Threshold readOnly />
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
                status={ComponentStatus.Disabled}
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
                status={ComponentStatus.Disabled}
                size={ComponentSize.Medium}
              />
            </Form.Element>
          </FlexBox.Child>
        </FlexBox>
        <FlexBox alignItems={AlignItems.Stretch} margin={ComponentSize.Medium}>
          <FlexBox.Child>
            <Form.Element label="Notification" required={true}>
              <Panel backgroundColor={InfluxColors.Onyx}>
                <Panel.Body>
                  <FlexBox
                    alignItems={AlignItems.Stretch}
                    margin={ComponentSize.Medium}
                  >
                    <Form.Element
                      required={true}
                      label="Endpoint"
                      className="endpoint-dropdown--element"
                    >
                      <Dropdown.Menu className="flows-endpoints--dropdown">
                        <Dropdown.Item selected={true}>
                          {DEFAULT_ENDPOINTS[data.endpoint].name}
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Form.Element>
                    <FlexBox.Child grow={1} shrink={1}>
                      <Form.Element
                        label="Details"
                        className="endpoint-details--element"
                      >
                        {React.createElement(
                          DEFAULT_ENDPOINTS[data.endpoint].view,
                          {readOnly: true}
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
                              onChangeText={() => {}}
                              readOnly
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
      </div>
      {warningMessage}
    </Context>
  )
}

export default ReadOnly
