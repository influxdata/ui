import React, {FC, useContext} from 'react'
import {Form, Input, InputType, ComponentSize} from '@influxdata/clockface'
import SecretsDropdown from 'src/secrets/components/SecretsDropdown'
import {PipeContext} from 'src/flows/context/pipe'
import {EndpointProps} from 'src/types'

export const Mailgun: FC<EndpointProps> = ({createSecret, secrets}) => {
  const {data, update} = useContext(PipeContext)

  const updateDomain = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        domain: evt.target.value,
      },
    })
  }

  const updateAPIKey = val => {
    update({
      endpointData: {
        ...data.endpointData,
        apiKey: val,
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
      <Form.Element label="API Key" required={true}>
        <SecretsDropdown
          selected={data.endpointData.apiKey}
          secrets={secrets}
          onCreate={createSecret}
          onSelect={updateAPIKey}
          testID="apiKey"
        />
      </Form.Element>
    </div>
  )
}
