import React, {FC, useContext} from 'react'
import {
  Form,
  Input,
  InputType,
  ComponentSize,
  ComponentStatus,
} from '@influxdata/clockface'

import {PipeContext} from 'src/flows/context/pipe'

const View: FC = () => {
  const {data, update} = useContext(PipeContext)

  const updateAPIKey = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        apiKey: evt.target.value,
      },
    })
  }

  const updateAPISecret = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        apiSecret: evt.target.value,
      },
    })
  }

  const updateEmail = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        email: evt.target.value,
      },
    })
  }

  return (
    <div className="slack-endpoint-details--flex">
      <Form.Element label="API Key" required={true}>
        <Input
          name="apiKey"
          type={InputType.Password}
          value={data.endpointData.apiKey}
          onChange={updateAPIKey}
          size={ComponentSize.Medium}
        />
      </Form.Element>
      <Form.Element label="API Secret" required={true}>
        <Input
          name="apiSecret"
          type={InputType.Password}
          value={data.endpointData.apiSecret}
          onChange={updateAPISecret}
          size={ComponentSize.Medium}
        />
      </Form.Element>
      <Form.Element label="To Email" required={true}>
        <Input
          name="email"
          type={InputType.Email}
          value={data.endpointData.email}
          onChange={updateEmail}
          size={ComponentSize.Medium}
        />
      </Form.Element>
      <Form.Element label="From Email">
        <Input
          name="fromEmail"
          type={InputType.Text}
          value={data.endpointData.fromEmail}
          size={ComponentSize.Medium}
          status={ComponentStatus.Disabled}
        />
      </Form.Element>
    </div>
  )
}

export default View
