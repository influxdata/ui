// Libraries
import React, {FC, useContext} from 'react'
import {
  ComponentStatus,
  Form,
  FlexBox,
  Input,
  InputType,
  ComponentSize,
} from '@influxdata/clockface'

// Types
import {PipeProp} from 'src/types/flows'
import {PipeContext} from 'src/flows/context/pipe'

import './style.scss'

const Schedule: FC<PipeProp> = ({Context}) => {
  const {data} = useContext(PipeContext)

  return (
    <Context>
      <FlexBox margin={ComponentSize.Medium}>
        <FlexBox.Child
          basis={168}
          grow={0}
          shrink={0}
          className="flow-panel-schedule--header"
        >
          <h5>Run this on a schedule</h5>
          <p>Must be exported as a task</p>
        </FlexBox.Child>
        <FlexBox.Child grow={1} shrink={1} style={{alignSelf: 'start'}}>
          <Form.Element label="Every" required={true}>
            <Input
              name="interval"
              type={InputType.Text}
              value={data.interval}
              status={ComponentStatus.Disabled}
              size={ComponentSize.Medium}
            />
          </Form.Element>
        </FlexBox.Child>

        <FlexBox.Child grow={1} shrink={1} style={{alignSelf: 'start'}}>
          <Form.Element label="Offset" required={false}>
            <Input
              name="interval"
              type={InputType.Text}
              placeholder="ex: 20m"
              value={data.offset}
              status={ComponentStatus.Disabled}
              size={ComponentSize.Medium}
            />
          </Form.Element>
        </FlexBox.Child>
      </FlexBox>
    </Context>
  )
}

export default Schedule
