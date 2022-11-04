import React, {FC, ChangeEvent} from 'react'
import {
  Columns,
  ComponentColor,
  Grid,
  Input,
  InputType,
  Form,
  QuestionMarkTooltip,
} from '@influxdata/clockface'

// Types
import {TaskSchedule, TaskOptions} from 'src/types'

interface Props {
  taskOptions: TaskOptions
  onChangeInput: (e: ChangeEvent<HTMLInputElement>) => void
}

const tooltipContents = {
  interval:
    'The is the interval at which the task runs. It also determines when the task first starts to run, depending on the specified time (in duration literal)',
  offset:
    'Offset delays the execution of the task but preserves the original time range',
  cron: 'Cron is an expression that defines the schedule on which the task runs. Cron scheduling is based on system time',
}

export const TaskSchedulerFormField: FC<Props> = props => {
  const {
    taskOptions: {taskScheduleType, cron, offset, interval},
    onChangeInput,
  } = props

  return (
    <div className="task-form-field">
      <Grid.Column widthXS={Columns.Six}>
        <Form.Element
          label={taskScheduleType === TaskSchedule.interval ? 'Every' : 'Cron'}
          required={true}
          className="task-form-labels"
        >
          <div className="schedule-tooltip">
            <QuestionMarkTooltip
              diameter={15}
              color={ComponentColor.Primary}
              tooltipContents={tooltipContents[taskScheduleType]}
            />
          </div>
          <Input
            name={taskScheduleType}
            type={InputType.Text}
            value={taskScheduleType === TaskSchedule.interval ? interval : cron}
            placeholder={
              taskScheduleType === TaskSchedule.interval ? '3h30s' : '02***'
            }
            onChange={onChangeInput}
            testID="task-form-every-input"
          />
        </Form.Element>
      </Grid.Column>
      <Grid.Column widthXS={Columns.Six}>
        <Form.Element
          label="Offset"
          required={true}
          className="task-form-labels"
        >
          <div className="schedule-tooltip">
            <QuestionMarkTooltip
              diameter={15}
              color={ComponentColor.Primary}
              tooltipContents={tooltipContents['offset']}
            />
          </div>
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
