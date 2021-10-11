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

  const updateChannel = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        channel: evt.target.value,
      },
    })
  }

  const updateToken = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        token: evt.target.value,
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
        <Input
          name="token"
          testID="input--token"
          type={InputType.Password}
          value={data.endpointData.token}
          onChange={updateToken}
          size={ComponentSize.Medium}
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

export default View
