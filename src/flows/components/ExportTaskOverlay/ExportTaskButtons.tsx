import React, {FC, useContext} from 'react'
import {useDispatch} from 'react-redux'
import {RouteProps, useHistory, useLocation} from 'react-router-dom'
import {
  Button,
  ButtonType,
  ComponentColor,
  ComponentStatus,
  Form,
} from '@influxdata/clockface'
import {ExportAsTask, OverlayContext} from 'src/flows/context/overlay'

// Utils
import {saveNewScript, updateTask} from 'src/tasks/actions/thunks'
import {event} from 'src/cloud/utils/reporting'

const ExportTaskButtons: FC = () => {
  const history = useHistory()

  const {
    activeTab,
    canSubmit,
    handleSetError,
    interval,
    selectedTask,
    taskName,
  } = useContext(OverlayContext)

  const location: RouteProps['location'] = useLocation()
  const params = location.state
  const {queryText} = params[0]

  const formattedQueryText = queryText
    .trim()
    .split('|>')
    .join('\n  |>')

  const dispatch = useDispatch()

  const onCreate = () => {
    if (!/\d/.test(interval)) {
      handleSetError(true)
      return
    }
    event('Save Flow as Task')
    const taskOption: string = `option task = { \n  name: "${taskName}",\n  every: ${interval},\n  offset: 0s\n}`
    const variable: string = `option v = {\n  timeRangeStart: -${interval},\n  timeRangeStop: now()\n}`
    const preamble = `${variable}\n\n${taskOption}`
    dispatch(saveNewScript(formattedQueryText, preamble))
  }

  const onUpdate = () => {
    if (!/\d/.test(interval) || !selectedTask?.name) {
      handleSetError(true)
      return
    }
    event('Update Task from Flow')
    const taskOption: string = `option task = { \n  name: "${selectedTask.name}",\n  every: ${interval},\n  offset: 0s\n}`
    const variable: string = `option v = {\n  timeRangeStart: -${interval},\n  timeRangeStop: now()\n}`
    const preamble = `${variable}\n\n${taskOption}`
    dispatch(
      updateTask({
        script: formattedQueryText,
        preamble,
        interval,
        task: selectedTask,
      })
    )
  }

  const onSubmit = activeTab === ExportAsTask.Create ? onCreate : onUpdate

  return (
    <Form.Footer>
      <Button
        text="Cancel"
        onClick={() => history.goBack()}
        titleText="Cancel"
        type={ButtonType.Button}
      />
      <Button
        text="Export Task"
        color={ComponentColor.Success}
        type={ButtonType.Submit}
        onClick={onSubmit}
        status={
          canSubmit() ? ComponentStatus.Default : ComponentStatus.Disabled
        }
        testID="task-form-export"
      />
    </Form.Footer>
  )
}

export default ExportTaskButtons
