import React, {FC, ChangeEvent, useState} from 'react'

// Components
import {
  Button,
  ButtonShape,
  ButtonType,
  Columns,
  ComponentColor,
  Form,
  Grid,
  IconFont,
  Input,
  Page,
  SelectGroup,
} from '@influxdata/clockface'
import {ScriptSelector} from 'src/tasks/components/TaskScheduler/ScriptSelector'
import {TaskIntervalForm} from 'src/tasks/components/TaskScheduler/TaskIntervalForm'

// Utils
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

// Types
import {TaskOptions, TaskSchedule} from 'src/types'

import 'src/tasks/components/TaskScheduler/TaskScheduler.scss'

interface Props {
  taskOptions: TaskOptions
  updateInput: (event: ChangeEvent<HTMLInputElement>) => void
  updateScheduleType: (schedule: TaskSchedule) => void
}

export const TaskScheduler: FC<Props> = ({
  taskOptions,
  updateInput,
  updateScheduleType,
}) => {
  const [taskName, setTaskName] = useState('')

  const handleChangeScheduleType = (schedule: TaskSchedule): void => {
    updateScheduleType(schedule)
  }

  return (
    <Page.Contents fullWidth={true} scrollable={false}>
      <Form onSubmit={() => {}}>
        <Grid>
          <Grid.Row>
            <Grid.Column widthXS={Columns.Five}>
              <div className="create-task-form">
                <p>
                  A task is a scheduled script that takes a stream of input
                  data, modifies or analyzes it, then writes the modified data
                  back to influxDB or perform other actions.{' '}
                  <SafeBlankLink href="https://docs.influxdata.com/influxdb/cloud/process-data/get-started/">
                    Learn More.
                  </SafeBlankLink>{' '}
                </p>
                <ScriptSelector />
                <div className="schedule-task">
                  <div className="create-task-titles">Schedule the Task</div>
                  <p>
                    Set the interval at which the task runs and an optional time
                    delay.
                  </p>
                  <SelectGroup shape={ButtonShape.StretchToFit}>
                    <SelectGroup.Option
                      name="task-schedule"
                      id="every"
                      active={
                        taskOptions.taskScheduleType === TaskSchedule.interval
                      }
                      value={TaskSchedule.interval}
                      titleText="Run task at regular intervals"
                      onClick={handleChangeScheduleType}
                      testID="task-card-every-btn"
                    >
                      Every
                    </SelectGroup.Option>
                    <SelectGroup.Option
                      name="task-schedule"
                      id="cron"
                      active={
                        taskOptions.taskScheduleType === TaskSchedule.cron
                      }
                      value={TaskSchedule.cron}
                      titleText="Use cron syntax for more control over scheduling"
                      onClick={handleChangeScheduleType}
                      testID="task-card-cron-btn"
                    >
                      Cron
                    </SelectGroup.Option>
                  </SelectGroup>
                  <Grid.Row>
                    <TaskIntervalForm
                      updateInput={updateInput}
                      taskOptions={taskOptions}
                    />
                  </Grid.Row>
                </div>
                <div className="name-task">
                  <div className="create-task-titles">Name the Task</div>
                  <div className="task-name-input">
                    <Form.Element label="Name" required={true}>
                      <Input
                        name="name"
                        onChange={event => setTaskName(event.target.value)}
                        value={taskName}
                        testID="task-form-name"
                      />
                    </Form.Element>
                  </div>
                </div>
                <Form.Footer>
                  <Button
                    text="Cancel"
                    color={ComponentColor.Tertiary}
                    onClick={() => {}}
                  />
                  <Button
                    text="Schedule Task"
                    testID="button--schedule"
                    icon={IconFont.Calendar}
                    color={ComponentColor.Primary}
                    type={ButtonType.Submit}
                  />
                </Form.Footer>
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
    </Page.Contents>
  )
}
