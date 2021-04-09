// Libraries
import React, {FC, useContext, useEffect, useMemo} from 'react'
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
import Slack from 'src/flows/pipes/Notification/Slack'
import Bucket from 'src/flows/pipes/Notification/Bucket'
import PagerDuty from 'src/flows/pipes/Notification/PagerDuty'
import HTTP from 'src/flows/pipes/Notification/HTTP'
import Threshold from 'src/flows/pipes/Notification/Threshold'

// Types
import {PipeProp} from 'src/types/flows'

export const DEFAULT_ENDPOINTS = {
  slack: {
    name: 'Slack',
    data: {
      url: 'https://hooks.slack.com/services/X/X/X',
      channel: '',
    },
    imports: ['slack'],
  },
  http: {
    name: 'HTTP Post',
    data: {
      auth: 'none',
      url: 'https://www.example.com/endpoint',
    },
    imports: ['http'],
  },
  pagerduty: {
    name: 'Pager Duty',
    data: {
      url: '',
      key: '',
    },
    imports: ['pagerduty'],
  },
  bucket: {
    name: 'Write to Bucket',
    data: {
      bucket: null,
    },
    imports: [],
  },
}

const Notification: FC<PipeProp> = ({Context}) => {
  const {id, data, queryText, update, results, loading} = useContext(
    PipeContext
  )
  let intervalError = ''
  let offsetError = ''

  useEffect(() => {
    update({
      panel: id,
      query: queryText,
    })
  }, [queryText, id])

  const numericColumns = (results.parsed.table?.columnKeys || []).filter(
    key => {
      if (key === 'result' || key === 'table') {
        return false
      }

      const columnType = results.parsed.table.getColumnType(key)

      return columnType === 'time' || columnType === 'number'
    }
  )

  if (
    data.interval &&
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
  const endpointInterface = useMemo(() => {
    if (data.endpoint === 'slack') {
      return <Slack />
    }

    if (data.endpoint === 'http') {
      return <HTTP />
    }

    if (data.endpoint === 'pagerduty') {
      return <PagerDuty />
    }

    if (data.endpoint === 'bucket') {
      return <Bucket />
    }
  }, [data.endpoint])

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
            {endpointInterface}
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
