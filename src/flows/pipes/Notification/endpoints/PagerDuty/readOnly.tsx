import React, {FC, useContext} from 'react'
import {
  Form,
  Input,
  InputType,
  ComponentSize,
  ComponentStatus,
  FlexBox,
  FlexDirection,
} from '@influxdata/clockface'

import {PipeContext} from 'src/flows/context/pipe'

export const PagerDutyReadOnly: FC = () => {
  const {data} = useContext(PipeContext)

  return (
    <FlexBox className="http-endpoint--flex" direction={FlexDirection.Column}>
      <Form.Element label="Client URL">
        <Input
          name="url"
          type={InputType.Text}
          value={data.endpointData.url}
          size={ComponentSize.Medium}
          status={ComponentStatus.Disabled}
        />
      </Form.Element>
      <Form.Element label="Routing Key">
        <Input
          name="key"
          type={InputType.Password}
          value={data.endpointData.key}
          size={ComponentSize.Medium}
          status={ComponentStatus.Disabled}
        />
      </Form.Element>
    </FlexBox>
  )
}
