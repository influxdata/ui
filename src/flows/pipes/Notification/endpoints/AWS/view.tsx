import React, {FC, useContext} from 'react'
import {Form, Input, InputType, ComponentSize} from '@influxdata/clockface'

import {PipeContext} from 'src/flows/context/pipe'

const View: FC = () => {
  const {data, update} = useContext(PipeContext)

  const updateURL = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        url: evt.target.value,
      },
    })
  }

  const updateAPIKey = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        apiKey: evt.target.value,
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
      <Form.Element label="URL" required={true}>
        <Input
          name="url"
          placeholder="https://email.your-aws-region.amazonaws.com/sendemail/v2/email/outbound-emails"
          type={InputType.Text}
          value={data.endpointData.url}
          onChange={updateURL}
          size={ComponentSize.Medium}
        />
      </Form.Element>
      <Form.Element label="API Key" required={true}>
        <Input
          name="apiKey"
          type={InputType.Password}
          value={data.endpointData.apiKey}
          onChange={updateAPIKey}
          size={ComponentSize.Medium}
        />
      </Form.Element>
      <Form.Element label="Email" required={true}>
        <Input
          name="email"
          type={InputType.Email}
          value={data.endpointData.email}
          onChange={updateEmail}
          size={ComponentSize.Medium}
        />
      </Form.Element>
    </div>
  )
}

export default View
