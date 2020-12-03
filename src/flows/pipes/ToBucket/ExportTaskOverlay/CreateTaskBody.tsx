// Libraries
import React, {FC, useContext} from 'react'

// Components
import {
  Columns,
  ComponentStatus,
  Form,
  Grid,
  Input,
  InputType,
  ComponentSize,
} from '@influxdata/clockface'
import QueryTextPreview from 'src/flows/components/QueryTextPreview'

// Contexts
import {Context} from 'src/flows/pipes/ToBucket/ExportTaskOverlay/context'

const CreateTaskBody: FC = () => {
  const {
    handleInputChange,
    interval,
    intervalError,
    taskName,
    taskNameError,
  } = useContext(Context)

  return (
    <>
      <Grid.Column widthXS={Columns.Nine}>
        <Form.Element label="Name" required={true} errorMessage={taskNameError}>
          <Input
            name="taskName"
            placeholder="Name your task"
            onChange={handleInputChange}
            value={taskName}
            testID="task-form-name"
            status={
              taskNameError ? ComponentStatus.Error : ComponentStatus.Default
            }
            size={ComponentSize.Medium}
          />
        </Form.Element>
      </Grid.Column>
      <Grid.Column widthXS={Columns.Three}>
        <Form.Element
          label="Run Every"
          required={true}
          errorMessage={intervalError}
        >
          <Input
            name="interval"
            type={InputType.Text}
            placeholder="ex: 3h30s"
            value={interval}
            onChange={handleInputChange}
            testID="task-form-schedule-input"
            status={
              intervalError ? ComponentStatus.Error : ComponentStatus.Default
            }
            size={ComponentSize.Medium}
          />
        </Form.Element>
      </Grid.Column>
      <Grid.Column>
        <Form.Element label="Preview">
          <QueryTextPreview />
        </Form.Element>
      </Grid.Column>
    </>
  )
}

export default CreateTaskBody
