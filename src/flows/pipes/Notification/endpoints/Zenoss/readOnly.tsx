import React, {FC, useContext} from 'react'
import {
  Form,
  Input,
  InputType,
  ComponentSize,
  ComponentStatus,
} from '@influxdata/clockface'
import {PipeContext} from 'src/flows/context/pipe'

export const ZenossReadOnly: FC = () => {
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
      <Form.Element label="Username" required={true}>
        <Input
          name="usename"
          testID="input--username"
          type={InputType.Email}
          value={data.endpointData.username}
          size={ComponentSize.Medium}
          status={ComponentStatus.Disabled}
        />
      </Form.Element>
      <Form.Element label="Password" required={true}>
        <Input
          name="password"
          testID="input--password"
          type={InputType.Email}
          value={data.endpointData.password}
          size={ComponentSize.Medium}
          status={ComponentStatus.Disabled}
        />
      </Form.Element>
      <Form.Element label="Action">
        <Input
          name="action"
          testID="input--action"
          type={InputType.Email}
          value={data.endpointData.action}
          size={ComponentSize.Medium}
          status={ComponentStatus.Disabled}
        />
      </Form.Element>
      <Form.Element label="Method">
        <Input
          name="method"
          testID="input--method"
          type={InputType.Email}
          value={data.endpointData.method}
          size={ComponentSize.Medium}
          status={ComponentStatus.Disabled}
        />
      </Form.Element>
    </div>
  )
}
