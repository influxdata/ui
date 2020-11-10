import React, {ChangeEvent, FC, useContext} from 'react'
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
import TaskDropdown from 'src/flows/components/ExportTaskOverlay/TaskDropdown'
import WarningPanel from 'src/flows/components/ExportTaskOverlay/WarningPanel'
import QueryTextPreview from 'src/flows/components/QueryTextPreview'
import {OverlayContext} from 'src/flows/context/overlay'
import {hasNoTasks as hasNoTasksSelector} from 'src/resources/selectors'

const UpdateTaskBody: FC = () => {
  const {interval, handleSetEveryInterval, hasError} = useContext(
    OverlayContext
  )

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
          errorMessage={hasError && 'This field cannot be empty'}
        >
          <TaskDropdown />
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
              handleSetEveryInterval(event.target.value)
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
        <QueryTextPreview />
      </Grid.Column>
    </>
  )
}

export default UpdateTaskBody
