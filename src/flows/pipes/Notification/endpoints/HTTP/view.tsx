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

import {PipeContext} from 'src/flows/context/pipe'
import {EndpointProps} from 'src/types'

const View: FC<EndpointProps> = () => {
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

  const updateUsername = evt => {
    updater('username', evt.target.value)
  }

  const updatePassword = evt => {
    updater('password', evt.target.value)
  }

  const updateToken = evt => {
    updater('token', evt.target.value)
  }

  let submenu

  if (data.endpointData.auth === 'basic') {
    submenu = (
      <>
        <Form.Element label="Username">
          <Input
            name="username"
            testID="input--username"
            type={InputType.Text}
            value={data.endpointData.username}
            onChange={updateUsername}
            size={ComponentSize.Medium}
          />
        </Form.Element>
        <Form.Element label="Password">
          <Input
            name="password"
            testID="input--password"
            type={InputType.Text}
            value={data.endpointData.password}
            onChange={updatePassword}
            size={ComponentSize.Medium}
          />
        </Form.Element>
      </>
    )
  } else if (data.endpointData.auth === 'bearer') {
    submenu = (
      <Form.Element label="Token">
        <Input
          name="token"
          testID="input--token"
          type={InputType.Text}
          value={data.endpointData.token}
          onChange={updateToken}
          size={ComponentSize.Medium}
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

export default View
