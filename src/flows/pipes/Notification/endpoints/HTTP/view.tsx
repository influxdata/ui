import React, {FC, useContext} from 'react'
import {
  Form,
  FlexBox,
  Input,
  InputType,
  ComponentSize,
  SelectGroup,
  FlexDirection,
  AlignItems,
} from '@influxdata/clockface'

import SecretsDropdown from 'src/secrets/components/SecretsDropdown'
import {PipeContext} from 'src/flows/context/pipe'
import {EndpointProps} from 'src/types'

export const HTTP: FC<EndpointProps> = ({createSecret, secrets}) => {
  const {data, update} = useContext(PipeContext)

  const updater = (field, value) => {
    update({
      endpointData: {
        ...data.endpointData,
        [field]: value,
      },
    })
  }

  const updateUrl = evt => {
    updater('url', evt.target.value)
  }

  const updateAuth = (auth: string) => {
    updater('auth', auth)
  }

  const updateUsername = val => {
    updater('username', val)
  }

  const updatePassword = val => {
    updater('password', val)
  }

  const updateToken = val => {
    updater('token', val)
  }

  let submenu

  if (data.endpointData.auth === 'basic') {
    submenu = (
      <>
        <Form.Element label="Username">
          <SecretsDropdown
            testID="username"
            selected={data.endpointData.username}
            secrets={secrets}
            onCreate={createSecret}
            onSelect={updateUsername}
          />
        </Form.Element>
        <Form.Element label="Password">
          <SecretsDropdown
            testID="password"
            selected={data.endpointData.password}
            secrets={secrets}
            onCreate={createSecret}
            onSelect={updatePassword}
          />
        </Form.Element>
      </>
    )
  } else if (data.endpointData.auth === 'bearer') {
    submenu = (
      <Form.Element label="Token">
        <SecretsDropdown
          testID="token"
          selected={data.endpointData.token}
          secrets={secrets}
          onCreate={createSecret}
          onSelect={updateToken}
        />
      </Form.Element>
    )
  }

  return (
    <>
      <FlexBox
        margin={ComponentSize.Medium}
        className="http-endpoint--flex"
        direction={FlexDirection.Column}
        alignItems={AlignItems.Stretch}
      >
        <FlexBox.Child grow={1} shrink={1}>
          <Form.Element label="Endpoint URL">
            <Input
              name="url"
              testID="input--url"
              type={InputType.Text}
              placeholder="ex: https://www.example.com/endpoint"
              value={data.endpointData.url}
              onChange={updateUrl}
              size={ComponentSize.Medium}
            />
          </Form.Element>
        </FlexBox.Child>
        <FlexBox.Child grow={0} shrink={0}>
          <Form.Element
            label="Authorization"
            className="form-element--authorization"
          >
            <SelectGroup>
              <SelectGroup.Option
                id="none"
                name="auth"
                testID="option--none"
                value="none"
                active={data.endpointData.auth === 'none'}
                onClick={updateAuth}
              >
                None
              </SelectGroup.Option>
              <SelectGroup.Option
                id="none"
                name="auth"
                testID="option--basic"
                value="basic"
                active={data.endpointData.auth === 'basic'}
                onClick={updateAuth}
              >
                Basic
              </SelectGroup.Option>
              <SelectGroup.Option
                id="bearer"
                name="auth"
                testID="option--bearer"
                value="bearer"
                active={data.endpointData.auth === 'bearer'}
                onClick={updateAuth}
              >
                Bearer
              </SelectGroup.Option>
            </SelectGroup>
          </Form.Element>
        </FlexBox.Child>
      </FlexBox>
      {submenu}
    </>
  )
}
