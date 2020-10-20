import React, {ChangeEvent, FC, useContext} from 'react'
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
import QueryTextPreview from 'src/flows/components/ExportTaskOverlay/QueryTextPreview'
import {OverlayContext} from 'src/flows/context/overlay'

type Props = {
  formattedQueryText: string
}

const UpdateTaskBody: FC<Props> = ({formattedQueryText}) => {
  const {interval, handleSetEveryInterval, hasError, tasks} = useContext(
    OverlayContext
  )

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
        <QueryTextPreview formattedQueryText={formattedQueryText} />
      </Grid.Column>
    </>
  )
}

export default UpdateTaskBody
