// Libraries
import React, {FC, lazy, Suspense, useContext} from 'react'

// Components
import {
  Columns,
  ComponentStatus,
  Form,
  Grid,
  Input,
  InputType,
  ComponentSize,
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'

// Contexts
import {Context} from 'src/flows/pipes/ToBucket/ExportTaskOverlay/context'
import {PopupContext} from 'src/flows/context/popup'
import {FlowQueryContext} from 'src/flows/context/flow.query'

// Utils
import {formatQueryText} from 'src/flows/shared/utils'

const FluxMonacoEditor = lazy(() =>
  import('src/shared/components/FluxMonacoEditor')
)

const CreateTaskBody: FC = () => {
  const {
    handleInputChange,
    interval,
    intervalError,
    taskName,
    taskNameError,
  } = useContext(Context)
  const {data} = useContext(PopupContext)
  const {getPanelQueries} = useContext(FlowQueryContext)
  const script = formatQueryText(getPanelQueries(data.panel, true).source)

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
