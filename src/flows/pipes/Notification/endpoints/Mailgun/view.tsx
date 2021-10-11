import React, {FC, useContext} from 'react'
import {Form, Input, InputType, ComponentSize} from '@influxdata/clockface'

import {PipeContext} from 'src/flows/context/pipe'

const View: FC = () => {
  const {data, update} = useContext(PipeContext)

  const updateDomain = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        domain: evt.target.value,
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
      <Form.Element label="Domain" required={true}>
        <Input
          name="domain"
          testID="input--domain"
          type={InputType.Text}
          value={data.endpointData.domain}
          onChange={updateDomain}
          size={ComponentSize.Medium}
        />
      </Form.Element>
      <Form.Element label="API Key" required={true}>
        <Input
          name="apiKey"
          testID="input--apiKey"
          type={InputType.Password}
          value={data.endpointData.apiKey}
          onChange={updateAPIKey}
          size={ComponentSize.Medium}
        />
      </Form.Element>
      <Form.Element label="Email" required={true}>
        <Input
          name="email"
          testID="input--email"
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
