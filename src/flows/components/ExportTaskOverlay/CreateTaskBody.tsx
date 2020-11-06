import React, {ChangeEvent, FC, useContext} from 'react'
import {
  Columns,
  ComponentStatus,
  Form,
  Grid,
  Input,
  InputType,
} from '@influxdata/clockface'
import QueryTextPreview from 'src/flows/components/QueryTextPreview'
import {OverlayContext} from 'src/flows/context/overlay'

const CreateTaskBody: FC = () => {
  const {
    handleSetEveryInterval,
    handleSetTaskName,
    hasError,
    interval,
    taskName,
  } = useContext(OverlayContext)

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
              handleSetTaskName(event.target.value)
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
              handleSetEveryInterval(event.target.value)
            }
            testID="task-form-schedule-input"
            status={hasError ? ComponentStatus.Error : ComponentStatus.Default}
          />
        </Form.Element>
      </Grid.Column>
      <Grid.Column>
        <QueryTextPreview />
      </Grid.Column>
    </>
  )
}

export default CreateTaskBody
