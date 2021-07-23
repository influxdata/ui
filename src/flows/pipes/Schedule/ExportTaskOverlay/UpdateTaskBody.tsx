import React, {FC, lazy, Suspense, useContext} from 'react'
import {useSelector} from 'react-redux'

import {
  Alert,
  Columns,
  ComponentColor,
  ComponentSize,
  EmptyState,
  Form,
  Grid,
  IconFont,
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'

import TaskDropdown from 'src/flows/pipes/Schedule/ExportTaskOverlay/TaskDropdown'
import {Context} from 'src/flows/pipes/Schedule/ExportTaskOverlay/context'

import {hasNoTasks as hasNoTasksSelector} from 'src/resources/selectors'

const FluxMonacoEditor = lazy(() =>
  import('src/shared/components/FluxMonacoEditor')
)
const UpdateTaskBody: FC = () => {
  const {script, selectedTask} = useContext(Context)

  const hasNoTasks = useSelector(hasNoTasksSelector)

  const warning = 'Note: Changes made to an existing task cannot be undone'

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
          errorMessage={!selectedTask?.name ? 'Please choose a task' : ''}
        >
          <TaskDropdown />
        </Form.Element>
      </Grid.Column>
      <Grid.Column>
        <Alert
          className="flow-update-task--export-warning"
          icon={IconFont.AlertTriangle}
          color={ComponentColor.Warning}
        >
          {warning}
        </Alert>
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
