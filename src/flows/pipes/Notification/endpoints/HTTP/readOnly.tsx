import React, {FC, useContext} from 'react'
import {
  Form,
  FlexBox,
  Input,
  InputType,
  ComponentSize,
  ComponentStatus,
  SelectGroup,
  FlexDirection,
  AlignItems,
} from '@influxdata/clockface'

import {PipeContext} from 'src/flows/context/pipe'

export const HTTPReadOnly: FC = () => {
  const {data} = useContext(PipeContext)

  let submenu

  if (data.endpointData.auth === 'basic') {
    submenu = (
      <>
        <Form.Element label="Username">
          <Input
            name="username"
            type={InputType.Text}
            value={data.endpointData.username}
            size={ComponentSize.Medium}
            status={ComponentStatus.Disabled}
          />
        </Form.Element>
        <Form.Element label="Password">
          <Input
            name="password"
            type={InputType.Text}
            value={data.endpointData.password}
            size={ComponentSize.Medium}
            status={ComponentStatus.Disabled}
          />
        </Form.Element>
      </>
    )
  } else if (data.endpointData.auth === 'bearer') {
    submenu = (
      <Form.Element label="Token">
        <Input
          name="token"
          type={InputType.Text}
          value={data.endpointData.token}
          size={ComponentSize.Medium}
          status={ComponentStatus.Disabled}
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
              type={InputType.Text}
              placeholder="ex: https://www.example.com/endpoint"
              value={data.endpointData.url}
              size={ComponentSize.Medium}
              status={ComponentStatus.Disabled}
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
                value="none"
                onClick={() => {}}
                active={data.endpointData.auth === 'none'}
                disabled
              >
                None
              </SelectGroup.Option>
              <SelectGroup.Option
                id="none"
                name="auth"
                value="basic"
                onClick={() => {}}
                active={data.endpointData.auth === 'basic'}
                disabled
              >
                Basic
              </SelectGroup.Option>
              <SelectGroup.Option
                id="bearer"
                name="auth"
                value="bearer"
                onClick={() => {}}
                active={data.endpointData.auth === 'bearer'}
                disabled
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
