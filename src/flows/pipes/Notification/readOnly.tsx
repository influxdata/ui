// Libraries
import React, {FC, useContext, useMemo, lazy, Suspense} from 'react'
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
  List,
  InfluxColors,
  TechnoSpinner,
  SpinnerContainer,
} from '@influxdata/clockface'
import Measurement from 'src/flows/pipes/Notification/Measurement'
import Threshold from 'src/flows/pipes/Notification/Threshold'

import {PipeContext} from 'src/flows/context/pipe'
import {ENDPOINT_DEFINITIONS} from 'src/flows/pipes/Notification/endpoints'
const NotificationMonacoEditor = lazy(
  () => import('src/flows/pipes/Notification/NotificationMonacoEditor')
)

// Types
import {RemoteDataState} from 'src/types'
import {PipeProp} from 'src/types/flows'

// Styles
import 'src/flows/pipes/Notification/styles.scss'

// Constants
import {UNPROCESSED_PANEL_TEXT} from 'src/flows'

const ReadOnly: FC<PipeProp> = ({Context}) => {
  const {data, results, loading} = useContext(PipeContext)

  const loadingText = useMemo(() => {
    if (loading === RemoteDataState.Loading) {
      return 'Loading'
    }

    if (loading === RemoteDataState.NotStarted) {
      return UNPROCESSED_PANEL_TEXT
    }

    return 'No Data Returned'
  }, [loading])

  const numericColumns = (results?.parsed?.table?.columnKeys || []).filter(
    key => {
      if (key === 'result' || key === 'table') {
        return false
      }

      const columnType = results.parsed.table.getColumnType(key)

      return columnType === 'time' || columnType === 'number'
    }
  )

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
      </Context>
    )
  }

  return (
    <Context>
      <div className="notification">
        <Measurement readOnly />
        <Threshold readOnly />
        <FlexBox margin={ComponentSize.Medium} style={{padding: '24px 0'}}>
          <FlexBox.Child grow={1} shrink={1}>
            <Form.Element
              label="Check Every"
              required={true}
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
            <Form.Element label="Query Offset" required={true}>
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
              <Panel backgroundColor={InfluxColors.Grey15}>
                <Panel.Body>
                  <FlexBox
                    alignItems={AlignItems.Stretch}
                    margin={ComponentSize.Medium}
                  >
                    <Form.Element
                      required={true}
                      label="Endpoint"
                      className="endpoint-list--element"
                    >
                      <List>
                        <List.Item selected={true}>
                          {ENDPOINT_DEFINITIONS[data.endpoint].name}
                        </List.Item>
                      </List>
                    </Form.Element>
                    <FlexBox.Child grow={1} shrink={1}>
                      <Form.Element
                        label="Details"
                        className="endpoint-details--element"
                      >
                        {React.createElement(
                          ENDPOINT_DEFINITIONS[data.endpoint].readOnlyComponent
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
    </Context>
  )
}

export default ReadOnly
