import React, {FC, useContext} from 'react'
import {
  Form,
  Input,
  InputType,
  ComponentSize,
  ComponentStatus,
} from '@influxdata/clockface'

import {PipeContext} from 'src/flows/context/pipe'

export const TelegramReadOnly: FC = () => {
  const {data} = useContext(PipeContext)

  return (
    <div className="slack-endpoint-details--flex">
      <Form.Element label="URL" required={true}>
        <Input
          name="url"
          testID="input--url"
          type={InputType.Text}
          value={data.endpointData.url}
          size={ComponentSize.Medium}
          status={ComponentStatus.Disabled}
        />
      </Form.Element>
      <Form.Element label="Channel" required={true}>
        <Input
          name="url"
          testID="input--channel"
          type={InputType.Text}
          value={data.endpointData.channel}
          size={ComponentSize.Medium}
          status={ComponentStatus.Disabled}
        />
      </Form.Element>
      <Form.Element label="Token" required={true}>
        <Input
          name="token"
          testID="input--token"
          type={InputType.Password}
          value={data.endpointData.token}
          size={ComponentSize.Medium}
          status={ComponentStatus.Disabled}
        />
      </Form.Element>
      <Form.Element label="Parse Mode">
        <Input
          name="parseMode"
          testID="input--parseMode"
          type={InputType.Email}
          value={data.endpointData.parseMode}
          size={ComponentSize.Medium}
          status={ComponentStatus.Disabled}
        />
      </Form.Element>
    </div>
  )
}
