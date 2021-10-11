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

  const updateAccessKey = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        accessKey: evt.target.value,
      },
    })
  }

  const updateAuthAlgo = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        authAlgo: evt.target.value,
      },
    })
  }

  const updateCredScope = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        credScope: evt.target.value,
      },
    })
  }

  const updateSignedHeaders = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        signedHeaders: evt.target.value,
      },
    })
  }

  const updateCalcSignature = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        calcSignature: evt.target.value,
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
          testID="input--url"
          type={InputType.Text}
          value={data.endpointData.url}
          onChange={updateURL}
          size={ComponentSize.Medium}
        />
      </Form.Element>
      <Form.Element label="Authorization Access Key" required={true}>
        <Input
          name="accessKey"
          testID="input--accessKey"
          type={InputType.Password}
          value={data.endpointData.accessKey}
          onChange={updateAccessKey}
          size={ComponentSize.Medium}
        />
      </Form.Element>
      <Form.Element label="Authorization Algorithm" required={true}>
        <Input
          name="authAlgo"
          testID="input--authAlgo"
          type={InputType.Password}
          value={data.endpointData.authAlgo}
          onChange={updateAuthAlgo}
          size={ComponentSize.Medium}
        />
      </Form.Element>
      <Form.Element label="Authorization Credential Scope" required={true}>
        <Input
          name="credScope"
          testID="input--credScope"
          type={InputType.Password}
          value={data.endpointData.credScope}
          onChange={updateCredScope}
          size={ComponentSize.Medium}
        />
      </Form.Element>
      <Form.Element label="Authorization Signed Headers" required={true}>
        <Input
          name="signedHeaders"
          testID="input--signedHeaders"
          type={InputType.Password}
          value={data.endpointData.signedHeaders}
          onChange={updateSignedHeaders}
          size={ComponentSize.Medium}
        />
      </Form.Element>
      <Form.Element label="Authorization Calculated Signature" required={true}>
        <Input
          name="calcSignature"
          testID="input--calcSignature"
          type={InputType.Password}
          value={data.endpointData.calcSignature}
          onChange={updateCalcSignature}
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
