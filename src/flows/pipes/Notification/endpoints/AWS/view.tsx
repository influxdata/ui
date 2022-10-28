import React, {FC, useContext} from 'react'
import {
  Form,
  Input,
  InputType,
  ComponentSize,
  FlexBox,
  AlignItems,
} from '@influxdata/clockface'
import {PipeContext} from 'src/flows/context/pipe'
import {EndpointProps} from 'src/types'
import SecretsDropdown from 'src/secrets/components/SecretsDropdown'

export const AWS: FC<EndpointProps> = ({createSecret, secrets}) => {
  const {data, update} = useContext(PipeContext)

  const updateURL = evt => {
    update({
      endpointData: {
        ...data.endpointData,
        url: evt.target.value,
      },
    })
  }

  const updateAccessKey = val => {
    update({
      endpointData: {
        ...data.endpointData,
        accessKey: val,
      },
    })
  }

  const updateAuthAlgo = val => {
    update({
      endpointData: {
        ...data.endpointData,
        authAlgo: val,
      },
    })
  }

  const updateCredScope = val => {
    update({
      endpointData: {
        ...data.endpointData,
        credScope: val,
      },
    })
  }

  const updateSignedHeaders = val => {
    update({
      endpointData: {
        ...data.endpointData,
        signedHeaders: val,
      },
    })
  }

  const updateCalcSignature = val => {
    update({
      endpointData: {
        ...data.endpointData,
        calcSignature: val,
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
      <FlexBox margin={ComponentSize.Medium} alignItems={AlignItems.FlexStart}>
        <FlexBox.Child grow={1} shrink={1}>
          <Form.Element label="Authorization Access Key" required={true}>
            <SecretsDropdown
              selected={data.endpointData.accessKey}
              secrets={secrets}
              onCreate={createSecret}
              onSelect={updateAccessKey}
              testID="accessKey"
            />
          </Form.Element>
          <Form.Element label="Authorization Algorithm" required={true}>
            <SecretsDropdown
              selected={data.endpointData.authAlgo}
              secrets={secrets}
              onCreate={createSecret}
              onSelect={updateAuthAlgo}
              testID="authAlgo"
            />
          </Form.Element>
          <Form.Element label="Authorization Credential Scope" required={true}>
            <SecretsDropdown
              selected={data.endpointData.credScope}
              secrets={secrets}
              onCreate={createSecret}
              onSelect={updateCredScope}
              testID="credScope"
            />
          </Form.Element>
        </FlexBox.Child>
        <FlexBox.Child grow={1} shrink={1}>
          <Form.Element label="Authorization Signed Headers" required={true}>
            <SecretsDropdown
              selected={data.endpointData.signedHeaders}
              secrets={secrets}
              onCreate={createSecret}
              onSelect={updateSignedHeaders}
              testID="signedHeaders"
            />
          </Form.Element>
          <Form.Element
            label="Authorization Calculated Signature"
            required={true}
          >
            <SecretsDropdown
              selected={data.endpointData.calcSignature}
              secrets={secrets}
              onCreate={createSecret}
              onSelect={updateCalcSignature}
              testID="calcSignature"
            />
          </Form.Element>
        </FlexBox.Child>
      </FlexBox>
    </div>
  )
}
