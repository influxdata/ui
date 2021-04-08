// Libraries
import React, {FC, useContext, useMemo} from 'react'
import {
  ComponentStatus,
  Form,
  FlexBox,
  Input,
  InputType,
  ComponentSize,
  Tabs,
  Orientation,
  TextArea,
  AlignItems,
} from '@influxdata/clockface'

import {PipeContext} from 'src/flows/context/pipe'
import Slack from 'src/flows/pipes/Notification/Slack'
import Bucket from 'src/flows/pipes/Notification/Bucket'
import PagerDuty from 'src/flows/pipes/Notification/PagerDuty'
import HTTP from 'src/flows/pipes/Notification/HTTP'

// Types
import {PipeProp} from 'src/types/flows'

const DEFAULT_ENDPOINTS = {
  slack: {
    name: 'Slack',
    data: {
      url: 'https://hooks.slack.com/services/X/X/X',
    },
  },
  http: {
    name: 'HTTP Post',
    data: {
      auth: 'none',
      url: 'https://www.example.com/endpoint',
    },
  },
  pagerduty: {
    name: 'Pager Duty',
    data: {
      url: '',
      key: '',
    },
  },
  bucket: {
    name: 'Write to Bucket',
    data: {
      bucket: null,
    },
  },
}

const Notification: FC<PipeProp> = ({Context}) => {
  const {data, update} = useContext(PipeContext)
  let intervalError = ''
  let offsetError = ''

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
        <FlexBox>
          <FlexBox.Child grow={1} shrink={1}>
            <h1>... insert threshold vs deadman interface here ...</h1>
          </FlexBox.Child>
        </FlexBox>
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
