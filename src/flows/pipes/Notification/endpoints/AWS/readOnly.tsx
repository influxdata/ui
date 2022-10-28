import React, {FC, useContext} from 'react'
import {
  Form,
  Input,
  InputType,
  ComponentSize,
  ComponentStatus,
} from '@influxdata/clockface'

import {PipeContext} from 'src/flows/context/pipe'

export const AWSReadOnly: FC = () => {
  const {data} = useContext(PipeContext)

  return (
    <div className="slack-endpoint-details--flex">
      <Form.Element label="URL" required={true}>
        <Input
          name="url"
          type={InputType.Text}
          value={data.endpointData.url}
          size={ComponentSize.Medium}
          status={ComponentStatus.Disabled}
        />
      </Form.Element>
      <Form.Element label="Authorization Access Key" required={true}>
        <Input
          name="accessKey"
          type={InputType.Password}
          value={data.endpointData.accessKey}
          size={ComponentSize.Medium}
          status={ComponentStatus.Disabled}
        />
      </Form.Element>
      <Form.Element label="Authorization Algorithm" required={true}>
        <Input
          name="authAlgo"
          type={InputType.Password}
          value={data.endpointData.authAlgo}
          size={ComponentSize.Medium}
          status={ComponentStatus.Disabled}
        />
      </Form.Element>
      <Form.Element label="Authorization Credential Scope" required={true}>
        <Input
          name="credScope"
          type={InputType.Password}
          value={data.endpointData.credScope}
          size={ComponentSize.Medium}
          status={ComponentStatus.Disabled}
        />
      </Form.Element>
      <Form.Element label="Authorization Signed Headers" required={true}>
        <Input
          name="signedHeaders"
          type={InputType.Password}
          value={data.endpointData.signedHeaders}
          size={ComponentSize.Medium}
          status={ComponentStatus.Disabled}
        />
      </Form.Element>
      <Form.Element label="Authorization Calculated Signature" required={true}>
        <Input
          name="calcSignature"
          type={InputType.Password}
          value={data.endpointData.calcSignature}
          size={ComponentSize.Medium}
          status={ComponentStatus.Disabled}
        />
      </Form.Element>
      <Form.Element label="Email" required={true}>
        <Input
          name="email"
          type={InputType.Email}
          value={data.endpointData.email}
          size={ComponentSize.Medium}
          status={ComponentStatus.Disabled}
        />
      </Form.Element>
    </div>
  )
}
