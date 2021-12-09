import React, {FC, useContext} from 'react'
import {Form, Input, InputType, ComponentSize} from '@influxdata/clockface'
import SecretsDropdown from 'src/secrets/components/SecretsDropdown'
import {PipeContext} from 'src/flows/context/pipe'
import {EndpointProps} from 'src/types'

const View: FC<EndpointProps> = ({createSecret, secrets}) => {
  const {data, update} = useContext(PipeContext)

  const updateAPIKey = val => {
    update({
      endpointData: {
        ...data.endpointData,
        apiKey: val,
      },
    })
  }

  const updateAPISecret = val => {
    update({
      endpointData: {
        ...data.endpointData,
        apiSecret: val,
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

  const updateFromEmail = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        fromEmail: evt.target.value,
      },
    })
  }

  return (
    <div className="slack-endpoint-details--flex">
      <Form.Element label="To Email" required={true}>
        <Input
          name="email"
          testID="input--email"
          type={InputType.Email}
          value={data.endpointData.email}
          onChange={updateEmail}
          size={ComponentSize.Medium}
        />
      </Form.Element>
      <Form.Element label="From Email" required={true}>
        <Input
          name="fromEmail"
          testID="input--fromEmail"
          type={InputType.Text}
          value={data.endpointData.fromEmail}
          size={ComponentSize.Medium}
          onChange={updateFromEmail}
        />
      </Form.Element>
      <Form.Element label="API Key" required={true}>
        <SecretsDropdown
          selected={data.endpointData.apiKey}
          secrets={secrets}
          onCreate={createSecret}
          onSelect={updateAPIKey}
          testID="apiKey"
        />
      </Form.Element>
      <Form.Element label="API Secret" required={true}>
        <SecretsDropdown
          selected={data.endpointData.apiSecret}
          secrets={secrets}
          onCreate={createSecret}
          onSelect={updateAPISecret}
          testID="apiSecret"
        />
      </Form.Element>
    </div>
  )
}

export default View
