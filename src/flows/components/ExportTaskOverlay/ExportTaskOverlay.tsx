// Libraries
import React, {ChangeEvent, FC, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {RouteProps, useHistory, useLocation} from 'react-router-dom'

// Components
import TaskDropdown from './TaskDropdown'
import QueryTextPreview from './QueryTextPreview'
import ExportTaskButtons from './ExportTaskButtons'
import WarningPanel from './WarningPanel'
import {
  ComponentStatus,
  EmptyState,
  Form,
  InputType,
  Input,
  Grid,
  Alignment,
  Columns,
  ComponentSize,
  Overlay,
  Tabs,
  Orientation,
} from '@influxdata/clockface'

// Utils
import {getAllTasks as getAllTasksSelector} from 'src/resources/selectors'
import {saveNewScript, updateTask} from 'src/tasks/actions/thunks'
import {getOrg} from 'src/organizations/selectors'
import {getTasks} from 'src/tasks/actions/thunks'
import {SelectableDurationTimeRange, TimeRange, Task} from 'src/types'

enum ExportAsTask {
  Create = 'create',
  Update = 'update',
}

const buildOutVariables = (timeRange: TimeRange | null): string => {
  if (timeRange === null) {
    return ''
  }
  if (timeRange.type === 'custom') {
    return `option v = {\n  timeRangeStart: ${timeRange.lower},\n  timeRangeStop: ${timeRange.upper}\n}`
  }
  const range = timeRange as SelectableDurationTimeRange
  const windowPeriod = `${range.windowPeriod}ms`
  let {lower} = timeRange
  let upper = ''
  if (timeRange.upper === null) {
    upper = 'now()'
    lower = `-${range.duration}`
  }
  return `option v = {\n  timeRangeStart: ${lower},\n  timeRangeStop: ${upper},\n  windowPeriod: ${windowPeriod}\n}`
}

const CreateTask = ({
  hasError,
  setTaskName,
  taskName,
  interval,
  setEveryInterval,
  formattedQueryText,
}) => {
  return (
    <>
      <Grid.Column widthXS={Columns.Nine}>
        <Form.Element
          label="Name"
          errorMessage={hasError && 'This field cannot be empty'}
        >
          <Input
            name="name"
            placeholder="Name your task"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setTaskName(event.target.value)
            }
            value={taskName}
            testID="task-form-name"
            status={hasError ? ComponentStatus.Error : ComponentStatus.Default}
          />
        </Form.Element>
      </Grid.Column>
      <Grid.Column widthXS={Columns.Three}>
        <Form.Element
          label="Run Every"
          errorMessage={hasError && 'Invalid Time'}
        >
          <Input
            name="schedule"
            type={InputType.Text}
            placeholder="3h30s"
            value={interval}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setEveryInterval(event.target.value)
            }
            testID="task-form-schedule-input"
            status={hasError ? ComponentStatus.Error : ComponentStatus.Default}
          />
        </Form.Element>
      </Grid.Column>
      <Grid.Column>
        <QueryTextPreview formattedQueryText={formattedQueryText} />
      </Grid.Column>
    </>
  )
}

const UpdateTask = ({
  interval,
  setEveryInterval,
  formattedQueryText,
  tasks,
  selectedTask,
  setTask,
  hasError,
}) => {
  if (tasks.length === 0) {
    return (
      <EmptyState size={ComponentSize.Medium}>
        <EmptyState.Text>You haven’t created any Tasks yet</EmptyState.Text>
      </EmptyState>
    )
  }
  return (
    <>
      <Grid.Column widthXS={Columns.Nine}>
        <Form.Element
          label="Name"
          errorMessage={hasError && 'This field cannot be empty'}
        >
          <TaskDropdown
            tasks={tasks}
            setTask={setTask}
            selectedTask={selectedTask}
          />
        </Form.Element>
      </Grid.Column>
      <Grid.Column widthXS={Columns.Three}>
        <Form.Element
          label="Run Every"
          errorMessage={hasError && 'Invalid Time'}
        >
          <Input
            name="schedule"
            type={InputType.Text}
            placeholder="3h30s"
            value={interval}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setEveryInterval(event.target.value)
            }
            testID="task-form-schedule-input"
            status={hasError ? ComponentStatus.Error : ComponentStatus.Default}
          />
        </Form.Element>
      </Grid.Column>
      <Grid.Column>
        <WarningPanel />
      </Grid.Column>
      <Grid.Column>
        <QueryTextPreview formattedQueryText={formattedQueryText} />
      </Grid.Column>
    </>
  )
}

const ExportTaskBody = ({
  activeTab,
  hasError,
  taskName,
  setTaskName,
  setEveryInterval,
  interval,
  formattedQueryText,
  tasks,
  setTask,
  selectedTask,
}) => {
  if (activeTab === ExportAsTask.Create) {
    return (
      <CreateTask
        hasError={hasError}
        setTaskName={setTaskName}
        taskName={taskName}
        setEveryInterval={setEveryInterval}
        interval={interval}
        formattedQueryText={formattedQueryText}
      />
    )
  }
  return (
    <UpdateTask
      hasError={hasError}
      setEveryInterval={setEveryInterval}
      interval={interval}
      formattedQueryText={formattedQueryText}
      tasks={tasks}
      setTask={setTask}
      selectedTask={selectedTask}
    />
  )
}

const ExportTaskOverlay: FC = () => {
  const [activeTab, setActiveTab] = useState(ExportAsTask.Create)
  const [selectedTask, setTask] = useState<Task>(undefined)
  const [hasError, setHasError] = useState(false)
  const tasks = useSelector(getAllTasksSelector)
  const [taskName, setTaskName] = useState('')
  const [interval, setEveryInterval] = useState('')

  const handleSetTaskName = (value: string): void => {
    if (hasError) {
      setHasError(false)
    }
    setTaskName(value)
  }
  const handleSetTask = (task: Task): void => {
    if (hasError) {
      setHasError(false)
    }
    setTask(task)
  }
  const handleSetEveryInterval = (value: string): void => {
    if (hasError) {
      setHasError(false)
    }
    setEveryInterval(value)
  }

  const history = useHistory()
  const location: RouteProps['location'] = useLocation()

  const params = location.state
  const {bucket, queryText, timeRange} = params[0]
  const org = useSelector(getOrg)

  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(getTasks())
  }, [dispatch])

  const onDismiss = () => {
    history.goBack()
  }

  const formattedQueryText = queryText
    .trim()
    .split('|>')
    .join('\n  |>')

  const onCreate = () => {
    if (!/\d/.test(interval)) {
      setHasError(true)
      return
    }
    const taskOption: string = `option task = { \n  name: "${taskName}",\n  every: ${interval},\n  offset: 0s\n}`
    const preamble = `${buildOutVariables(timeRange)}\n\n${taskOption}`
    const trimmedOrgName = org.name.trim()
    const script: string = `${formattedQueryText}\n  |> to(bucket: "${bucket?.name.trim()}", org: "${trimmedOrgName}")`
    dispatch(saveNewScript(script, preamble))
  }

  const onUpdate = () => {
    if (!/\d/.test(interval) || !selectedTask?.name) {
      setHasError(true)
      return
    }
    const taskOption: string = `option task = { \n  name: "${selectedTask.name}",\n  every: ${interval},\n  offset: 0s\n}`
    const preamble = `${buildOutVariables(timeRange)}\n\n${taskOption}`
    const trimmedOrgName = org.name.trim()
    const script: string = `${formattedQueryText}\n  |> to(bucket: "${bucket?.name.trim()}", org: "${trimmedOrgName}")`
    dispatch(updateTask({script, preamble, interval, task: selectedTask}))
  }

  const onSubmit = activeTab === ExportAsTask.Create ? onCreate : onUpdate

  const canSubmit = () => {
    if (activeTab === ExportAsTask.Create) {
      return !!taskName && interval !== ''
    }
    return interval !== '' && !!selectedTask?.name
  }

  return (
    <Overlay visible={true}>
      <Overlay.Container maxWidth={600}>
        <Overlay.Header
          title="Export As Task"
          onDismiss={onDismiss}
          testID="export-as-overlay--header"
        />
        <Overlay.Body>
          <Tabs.Container orientation={Orientation.Horizontal}>
            <Tabs alignment={Alignment.Left} size={ComponentSize.Small}>
              <Tabs.Tab
                id={ExportAsTask.Create}
                text="Create New"
                testID="task--radio-button"
                onClick={() => setActiveTab(ExportAsTask.Create)}
                active={activeTab === ExportAsTask.Create}
              />
              <Tabs.Tab
                id={ExportAsTask.Update}
                text="Update Existing"
                testID="variable-radio-button"
                onClick={() => setActiveTab(ExportAsTask.Update)}
                active={activeTab === ExportAsTask.Update}
              />
            </Tabs>
            <Tabs.TabContents>
              <Form>
                <Grid>
                  <Grid.Row>
                    <ExportTaskBody
                      setEveryInterval={handleSetEveryInterval}
                      activeTab={activeTab}
                      interval={interval}
                      setTaskName={handleSetTaskName}
                      taskName={taskName}
                      formattedQueryText={formattedQueryText}
                      tasks={tasks}
                      selectedTask={selectedTask}
                      setTask={handleSetTask}
                      hasError={hasError}
                    />
                    <Grid.Column widthXS={Columns.Twelve}>
                      <ExportTaskButtons
                        onDismiss={onDismiss}
                        canSubmit={canSubmit}
                        onSubmit={onSubmit}
                      />
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </Form>
            </Tabs.TabContents>
          </Tabs.Container>
        </Overlay.Body>
      </Overlay.Container>
    </Overlay>
  )
}

export default ExportTaskOverlay
