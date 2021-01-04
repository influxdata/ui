import React, {FC, useContext} from 'react'
import {useSelector} from 'react-redux'

import {
  Columns,
  ComponentSize,
  ComponentStatus,
  EmptyState,
  Form,
  Grid,
  Input,
  InputType,
} from '@influxdata/clockface'

import TaskDropdown from 'src/flows/pipes/ToBucket/ExportTaskOverlay/TaskDropdown'
import WarningPanel from 'src/flows/pipes/ToBucket/ExportTaskOverlay/WarningPanel'
import {Context} from 'src/flows/pipes/ToBucket/ExportTaskOverlay/context'

import QueryTextPreview from 'src/flows/components/QueryTextPreview'
import {hasNoTasks as hasNoTasksSelector} from 'src/resources/selectors'

const UpdateTaskBody: FC = () => {
  const {
    interval,
    intervalError,
    handleInputChange,
    selectedTaskError,
  } = useContext(Context)

  const hasNoTasks = useSelector(hasNoTasksSelector)

  if (hasNoTasks) {
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
          required={true}
          errorMessage={selectedTaskError}
        >
          <TaskDropdown />
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
            size={ComponentSize.Medium}
            status={
              intervalError ? ComponentStatus.Error : ComponentStatus.Default
            }
          />
        </Form.Element>
      </Grid.Column>
      <Grid.Column>
        <WarningPanel />
        <Form.Element label="Preview">
          <QueryTextPreview />
        </Form.Element>
      </Grid.Column>
    </>
  )
}

export default UpdateTaskBody
