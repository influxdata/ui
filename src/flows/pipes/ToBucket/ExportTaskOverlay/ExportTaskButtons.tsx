import React, {FC, useContext} from 'react'
import {useDispatch} from 'react-redux'
import {
  Button,
  ButtonType,
  ComponentColor,
  ComponentStatus,
  Form,
} from '@influxdata/clockface'
import {
  ExportAsTask,
  Context,
} from 'src/flows/pipes/ToBucket/ExportTaskOverlay/context'
import {PopupContext} from 'src/flows/context/popup'

// Utils
import {saveNewScript, updateTask} from 'src/tasks/actions/thunks'
import {event} from 'src/cloud/utils/reporting'
import {formatQueryText} from 'src/flows/shared/utils'

const ExportTaskButtons: FC = () => {
  const {
    activeTab,
    canSubmit,
    handleSetError,
    interval,
    selectedTask,
    taskName,
  } = useContext(Context)
  const {data, closeFn} = useContext(PopupContext)

  const script = formatQueryText(data.query)

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

    dispatch(saveNewScript(script, preamble))
    closeFn()
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
        script,
        preamble,
        interval,
        task: selectedTask,
      })
    )
    closeFn()
  }

  const onSubmit = activeTab === ExportAsTask.Create ? onCreate : onUpdate

  return (
    <Form.Footer>
      <Button
        text="Cancel"
        onClick={closeFn}
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
