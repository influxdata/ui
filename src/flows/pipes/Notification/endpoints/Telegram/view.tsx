import React, {FC, useContext} from 'react'
import {Form, Input, InputType, ComponentSize} from '@influxdata/clockface'
import SecretsDropdown from 'src/secrets/components/SecretsDropdown'
import {EndpointProps} from 'src/types'
import {PipeContext} from 'src/flows/context/pipe'

export const Telegram: FC<EndpointProps> = ({createSecret, secrets}) => {
  const {data, update} = useContext(PipeContext)

  const updateURL = evt => {
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

  const updateToken = val => {
    update({
      endpointData: {
        ...data.endpointData,
        token: val,
      },
    })
  }

  const updateParseMode = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        parseMode: evt.target.value,
      },
    })
  }

  return (
    <div className="slack-endpoint-details--flex">
      <Form.Element label="URL" required={true}>
        <Input
          name="url"
          testID="input--url"
          type={InputType.Text}
          value={data.endpointData.url}
          onChange={updateURL}
          size={ComponentSize.Medium}
        />
      </Form.Element>
      <Form.Element label="Channel" required={true}>
        <Input
          name="channel"
          testID="input--channel"
          type={InputType.Text}
          value={data.endpointData.channel}
          onChange={updateChannel}
          size={ComponentSize.Medium}
        />
      </Form.Element>
      <Form.Element label="Token" required={true}>
        <SecretsDropdown
          selected={data.endpointData.token}
          secrets={secrets}
          onCreate={createSecret}
          onSelect={updateToken}
          testID="token"
        />
      </Form.Element>
      <Form.Element label="Parse Mode">
        <Input
          name="parseMode"
          testID="input--parseMode"
          type={InputType.Email}
          value={data.endpointData.parseMode}
          onChange={updateParseMode}
          size={ComponentSize.Medium}
        />
      </Form.Element>
    </div>
  )
}
