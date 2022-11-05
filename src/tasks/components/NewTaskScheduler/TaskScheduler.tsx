import React, {FC, ChangeEvent, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

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
import {ScriptSelector} from 'src/tasks/components/NewTaskScheduler/ScriptSelector'
import {TaskSchedulerFormField} from 'src/tasks/components/NewTaskScheduler/TaskSchedulerFormField'

// Actions
import {getScripts} from 'src/tasks/actions/thunks'
import {getAllScripts} from 'src/tasks/selectors'

// Utils
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

// Types
import {TaskOptions, TaskSchedule} from 'src/types'

import 'src/tasks/components/NewTaskScheduler/TaskScheduler.scss'

interface Props {
  taskOptions: TaskOptions
  onChangeScheduleType: (schedule: TaskSchedule) => void
  onChangeInput: (event: ChangeEvent<HTMLInputElement>) => void
}

export const TaskScheduler: FC<Props> = ({
  taskOptions,
  onChangeScheduleType,
  onChangeInput,
}) => {
  const dispatch = useDispatch()
  const scripts = useSelector(getAllScripts)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedScript, setSelectedScript] = useState<any>({})
  const [taskName, setTaskName] = useState('')

  useEffect(() => {
    dispatch(getScripts())
  }, [dispatch])

  const searchForTerm = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleChangeScheduleType = (schedule: TaskSchedule): void => {
    onChangeScheduleType(schedule)
  }

  return (
    <Page.Contents fullWidth={true} scrollable={false}>
      <Form onSubmit={() => {}}>
        <Grid>
          <Grid.Row>
            <Grid.Column widthXS={Columns.Five}>
              <p>
                A task is a scheduled script that takes a stream of input data,
                modifies or analyzes it, then writes the modified data back to
                influxDB or perform other actions.{' '}
                <SafeBlankLink href="https://docs.influxdata.com/influxdb/cloud/process-data/get-started/">
                  Learn More.
                </SafeBlankLink>{' '}
              </p>
              <ScriptSelector
                loading={scripts.status}
                scripts={scripts.scripts}
                searchTerm={searchTerm}
                selectedScript={selectedScript}
                setSelectedScript={setSelectedScript}
                searchForTerm={searchForTerm}
              />
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
                    active={taskOptions.taskScheduleType === TaskSchedule.cron}
                    value={TaskSchedule.cron}
                    titleText="Use cron syntax for more control over scheduling"
                    onClick={handleChangeScheduleType}
                    testID="task-card-cron-btn"
                  >
                    Cron
                  </SelectGroup.Option>
                </SelectGroup>
                <Grid.Row>
                  <TaskSchedulerFormField
                    onChangeInput={onChangeInput}
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
                      onChange={evt => {
                        setTaskName(evt.target.value)
                      }}
                      value={taskName}
                      testID="task-form-name"
                    />
                  </Form.Element>
                </div>
              </div>
              <Form.Footer style={{justifyContent: 'end'}}>
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
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
    </Page.Contents>
  )
}
