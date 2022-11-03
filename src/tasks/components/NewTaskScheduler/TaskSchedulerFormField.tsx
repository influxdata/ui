import React, {FC, ChangeEvent} from 'react'
import {
  Columns,
  Grid,
  Input,
  FlexBox,
  FlexDirection,
  ComponentSize,
  InputType,
  Form,
} from '@influxdata/clockface'

// Types
import {TaskSchedule} from 'src/types'

interface Props {
  schedule: TaskSchedule
  cron: string
  offset: string
  interval: string
  onChangeInput: (e: ChangeEvent<HTMLInputElement>) => void
}

const TaskSchedulerFormField: FC<Props> = props => {
  const {schedule, cron, offset, interval, onChangeInput} = props

  return (
    <div className="task-form-field">
      <Grid.Column widthXS={Columns.Six}>
        <FlexBox
          direction={FlexDirection.Row}
          margin={ComponentSize.ExtraSmall}
        >
          <Form.Element
            label={schedule === TaskSchedule.interval ? 'Every' : 'Cron'}
            required={true}
          >
            <Input
              name={schedule}
              type={InputType.Text}
              value={schedule === TaskSchedule.interval ? interval : cron}
              placeholder={
                schedule === TaskSchedule.interval ? '3h30s' : '02***'
              }
              onChange={onChangeInput}
              testID="task-form-every-input"
            />
          </Form.Element>
        </FlexBox>
      </Grid.Column>
      <Grid.Column widthXS={Columns.Six}>
        <Form.Element label="Offset" required={true}>
          <Input
            name="offset"
            type={InputType.Text}
            value={offset}
            placeholder="20m"
            onChange={onChangeInput}
            testID="task-form-offset-input"
          />
        </Form.Element>
      </Grid.Column>
    </div>
  )
}

export default TaskSchedulerFormField
