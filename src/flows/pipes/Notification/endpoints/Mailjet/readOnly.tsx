import React, {FC, useContext} from 'react'
import {
  Form,
  Input,
  InputType,
  ComponentSize,
  ComponentStatus,
} from '@influxdata/clockface'

import {PipeContext} from 'src/flows/context/pipe'

export const MailjetReadOnly: FC = () => {
  const {data} = useContext(PipeContext)

  return (
    <div className="slack-endpoint-details--flex">
      <Form.Element label="API Key" required={true}>
        <Input
          name="apiKey"
          type={InputType.Password}
          value={data.endpointData.apiKey}
          size={ComponentSize.Medium}
          status={ComponentStatus.Disabled}
        />
      </Form.Element>
      <Form.Element label="API Secret" required={true}>
        <Input
          name="apiSecret"
          type={InputType.Password}
          value={data.endpointData.apiSecret}
          size={ComponentSize.Medium}
          status={ComponentStatus.Disabled}
        />
      </Form.Element>
      <Form.Element label="To Email" required={true}>
        <Input
          name="email"
          type={InputType.Email}
          value={data.endpointData.email}
          size={ComponentSize.Medium}
          status={ComponentStatus.Disabled}
        />
      </Form.Element>
      <Form.Element label="From Email" required={true}>
        <Input
          name="fromEmail"
          type={InputType.Text}
          placeholder="alerts@influxdata.com"
          value={data.endpointData.fromEmail}
          size={ComponentSize.Medium}
          status={ComponentStatus.Disabled}
        />
      </Form.Element>
    </div>
  )
}
