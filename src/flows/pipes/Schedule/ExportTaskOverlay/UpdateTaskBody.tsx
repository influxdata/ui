import React, {FC, lazy, Suspense, useContext} from 'react'
import {useSelector} from 'react-redux'

import {
  Columns,
  ComponentSize,
  EmptyState,
  Form,
  Grid,
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'

import TaskDropdown from 'src/flows/pipes/Schedule/ExportTaskOverlay/TaskDropdown'
import WarningPanel from 'src/flows/pipes/Schedule/ExportTaskOverlay/WarningPanel'
import {Context} from 'src/flows/pipes/Schedule/ExportTaskOverlay/context'

import {hasNoTasks as hasNoTasksSelector} from 'src/resources/selectors'

const FluxMonacoEditor = lazy(() =>
  import('src/shared/components/FluxMonacoEditor')
)
const UpdateTaskBody: FC = () => {
  const {script, selectedTask} = useContext(Context)

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
          errorMessage={!selectedTask?.name ? 'Please choose a task' : ''}
        >
          <TaskDropdown />
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
