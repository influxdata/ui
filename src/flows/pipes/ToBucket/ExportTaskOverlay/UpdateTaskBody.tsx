import React, {FC, lazy, Suspense, useContext} from 'react'
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
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'

import TaskDropdown from 'src/flows/pipes/ToBucket/ExportTaskOverlay/TaskDropdown'
import WarningPanel from 'src/flows/pipes/ToBucket/ExportTaskOverlay/WarningPanel'
import {Context} from 'src/flows/pipes/ToBucket/ExportTaskOverlay/context'
import {PopupContext} from 'src/flows/context/popup'
import {FlowQueryContext} from 'src/flows/context/flow.query'

// Utils
import {formatQueryText} from 'src/flows/shared/utils'

import {hasNoTasks as hasNoTasksSelector} from 'src/resources/selectors'

const FluxMonacoEditor = lazy(() =>
  import('src/shared/components/FluxMonacoEditor')
)

const UpdateTaskBody: FC = () => {
  const {
    interval,
    intervalError,
    handleInputChange,
    selectedTaskError,
  } = useContext(Context)
  const {data} = useContext(PopupContext)
  const {getPanelQueries} = useContext(FlowQueryContext)
  const script = formatQueryText(getPanelQueries(data.panel, true).source)

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

export default UpdateTaskBody
