// Libraries
import React, {
  FC,
  lazy,
  Suspense,
  ChangeEvent,
  useContext,
  useState,
} from 'react'

// Components
import {
  Columns,
  ComponentStatus,
  Form,
  Grid,
  Input,
  ComponentSize,
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
  InputRef,
} from '@influxdata/clockface'
// Contexts
import {Context} from 'src/flows/pipes/Schedule/ExportTaskOverlay/context'

const FluxMonacoEditor = lazy(() =>
  import('src/shared/components/FluxMonacoEditor')
)

const CreateTaskBody: FC = () => {
  const {script, taskName, handleSetTaskName} = useContext(Context)
  const [taskError, setTaskError] = useState('')

  const handleInputChange = (e: ChangeEvent<InputRef>) => {
    const taskName = e.target.value
    handleSetTaskName(taskName)

    if (taskName.trim() === '') {
      setTaskError('Cannot be empty')
    } else {
      setTaskError('')
    }
  }

  return (
    <>
      <Grid.Column widthXS={Columns.Nine}>
        <Form.Element label="Name" required={true} errorMessage={taskError}>
          <Input
            name="taskName"
            placeholder="Name your task"
            onChange={handleInputChange}
            value={taskName}
            testID="task-form-name"
            status={taskError ? ComponentStatus.Error : ComponentStatus.Default}
            size={ComponentSize.Medium}
          />
        </Form.Element>
      </Grid.Column>
      <Grid.Column>
        <Form.Element label="Preview">
          <Suspense
            fallback={
              <SpinnerContainer
                loading={RemoteDataState.Loading}
                spinnerComponent={<TechnoSpinner />}
              />
            }
          >
            <FluxMonacoEditor
              script={script}
              onChangeScript={() => {}}
              readOnly
              autogrow
            />
          </Suspense>
        </Form.Element>
      </Grid.Column>
    </>
  )
}

export default CreateTaskBody
