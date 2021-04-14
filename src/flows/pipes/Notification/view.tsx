// Libraries
import React, {FC, useContext, useEffect} from 'react'
import {
  ComponentStatus,
  Form,
  FlexBox,
  Input,
  InputType,
  Icon,
  IconFont,
  ComponentSize,
  Tabs,
  Orientation,
  TextArea,
  AlignItems,
} from '@influxdata/clockface'
import {RemoteDataState} from 'src/types'

import {PipeContext} from 'src/flows/context/pipe'
import Threshold, {
  THRESHOLD_TYPES,
} from 'src/flows/pipes/Notification/Threshold'
import {DEFAULT_ENDPOINTS} from 'src/flows/pipes/Notification/Endpoints'

// Types
import {PipeProp} from 'src/types/flows'

const Notification: FC<PipeProp> = ({Context}) => {
  const {id, data, queryText, update, results, loading} = useContext(
    PipeContext
  )
  let intervalError = ''
  let offsetError = ''

  if (!data.interval) {
    intervalError = 'An Interval is Required'
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

  useEffect(() => {
    if (intervalError || offsetError) {
      update({
        query: '',
      })

      return
    }

    const condition = THRESHOLD_TYPES[data.threshold.type].condition(data)
    const query = `
import "strings"
import "regexp"
import "influxdata/influxdb/monitor"
import "influxdata/influxdb/schema"
import "influxdata/influxdb/secrets"
import "experimental"
${DEFAULT_ENDPOINTS[data.endpoint]?.generateImports()}

option task = {name: "Notebook Generated Task From Panel ${id}", every: ${
      data.interval
    }, offset: ${data.offset || 0}}
check = {
	_check_id: "${id}",
	_check_name: "Notebook Generated Check",
	_type: "custom",
	tags: {},
}
notification = {
	_notification_rule_id: "${id}",
	_notification_rule_name: "Notebook Generated Rule",
	_notification_endpoint_id: "${id}",
	_notification_endpoint_name: "Notebook Generated Endpoint",
}

task_data = ${queryText}
trigger = ${condition}
messageFn = (r) => ("${data.message}")

${DEFAULT_ENDPOINTS[data.endpoint]?.generateQuery(data)}`

    update({
      query,
    })
  }, [queryText, id, intervalError, offsetError])

  const numericColumns = (results.parsed.table?.columnKeys || []).filter(
    key => {
      if (key === 'result' || key === 'table') {
        return false
      }

      const columnType = results.parsed.table.getColumnType(key)

      return columnType === 'time' || columnType === 'number'
    }
  )

  const updateMessage = evt => {
    update({
      message: evt.target.value,
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
    update({
      endpoint: which,
      endpointData: DEFAULT_ENDPOINTS[which].data,
    })
  }

  const avail = Object.keys(DEFAULT_ENDPOINTS).map(k => (
    <Tabs.Tab
      key={k}
      id={k}
      onClick={() => updateEndpoint(k)}
      text={DEFAULT_ENDPOINTS[k].name}
      active={data.endpoint === k}
    />
  ))

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
            <div className="panel-resizer--empty">
              This cell requires results from the previous cell
            </div>
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
        <FlexBox margin={ComponentSize.Medium}>
          <FlexBox.Child grow={1} shrink={1}>
            <Form.Element
              label="Check Every"
              required={true}
              errorMessage={intervalError}
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
        <Threshold />
        <FlexBox
          alignItems={AlignItems.FlexStart}
          margin={ComponentSize.Medium}
        >
          <FlexBox.Child grow={0} shrink={0}>
            <Tabs orientation={Orientation.Vertical}>{avail}</Tabs>
          </FlexBox.Child>
          <FlexBox.Child grow={1} shrink={1}>
            {React.createElement(DEFAULT_ENDPOINTS[data.endpoint].view)}
          </FlexBox.Child>
          <FlexBox.Child grow={2} shrink={1}>
            <Form.Element label="Message Format" required={true}>
              <TextArea
                name="message"
                rows={10}
                value={data.message}
                onChange={updateMessage}
                size={ComponentSize.Medium}
              />
            </Form.Element>
          </FlexBox.Child>
        </FlexBox>
      </div>
    </Context>
  )
}

export default Notification
