import React, {FC, useContext} from 'react'
import {
  ColorPicker,
  Form,
  Input,
  InputType,
  ComponentSize,
} from '@influxdata/clockface'

import {PipeContext} from 'src/flows/context/pipe'
import {EndpointProps} from 'src/types'

const View: FC<EndpointProps> = () => {
  const {data, update} = useContext(PipeContext)

  const updateUrl = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        url: evt.target.value,
      },
    })
  }

  const updateChannel = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        channel: evt.target.value,
      },
    })
  }

  const updateColor = hex => {
    update({
      endpointData: {
        ...data.endpointData,
        color: hex,
      },
    })
  }

  return (
    <div className="slack-endpoint-details--flex">
      <Form.Element label="Incoming Webhook URL" required={true}>
        <Input
          name="url"
          testID="input--url"
          type={InputType.Text}
          placeholder="ex: https://hooks.slack.com/services/X/X/X"
          value={data.endpointData.url}
          onChange={updateUrl}
          size={ComponentSize.Medium}
        />
      </Form.Element>
      <Form.Element label="Slack Channel" required={true}>
        <Input
          name="channel"
          testID="input--channel"
          type={InputType.Text}
          value={data.endpointData.channel}
          onChange={updateChannel}
          size={ComponentSize.Medium}
        />
      </Form.Element>
      <Form.Element label="Message Color">
        <ColorPicker color={data.endpointData.color} onChange={updateColor} />
      </Form.Element>
    </div>
  )
}

export default View
