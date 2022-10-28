import React, {FC, useContext} from 'react'
import {
  Form,
  Input,
  InputType,
  ComponentSize,
  ComponentStatus,
} from '@influxdata/clockface'

import {PipeContext} from 'src/flows/context/pipe'

export const SlackReadOnly: FC = () => {
  const {data} = useContext(PipeContext)

  return (
    <div className="slack-endpoint-details--flex">
      <Form.Element label="Incoming Webhook URL" required={true}>
        <Input
          name="url"
          type={InputType.Text}
          placeholder="ex: https://hooks.slack.com/services/X/X/X"
          value={data.endpointData.url}
          size={ComponentSize.Medium}
          status={ComponentStatus.Disabled}
        />
      </Form.Element>
      <Form.Element label="Slack Channel" required={true}>
        <Input
          name="channel"
          type={InputType.Text}
          value={data.endpointData.channel}
          size={ComponentSize.Medium}
          status={ComponentStatus.Disabled}
        />
      </Form.Element>
      <Form.Element label="Message Color">
        <Input
          name="color"
          type={InputType.Text}
          value={data.endpointData.color}
          size={ComponentSize.Medium}
          status={ComponentStatus.Disabled}
        />
      </Form.Element>
    </div>
  )
}
