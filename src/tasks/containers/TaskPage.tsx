// Libraries
import React, {FC, lazy, Suspense, useEffect, ChangeEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'

// Components
import TaskForm from 'src/tasks/components/TaskForm'
import TaskHeader from 'src/tasks/components/TaskHeader'
import TaskScheduler from 'src/tasks/components/NewTaskScheduler/TaskScheduler'
import {Page} from '@influxdata/clockface'

// Actions and Selectors
import {
  setNewScript,
  setTaskOption,
  clearTask,
} from 'src/tasks/actions/creators'
import {saveNewScript, goToTasks, cancel} from 'src/tasks/actions/thunks'
import {getAllVariables} from 'src/variables/selectors'

// Utils
import {
  taskOptionsToFluxScript,
  addDestinationToFluxScript,
} from 'src/utils/taskOptionsToFluxScript'
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Types
import {AppState, TaskOptionKeys, TaskSchedule} from 'src/types'

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps

const FluxMonacoEditor = lazy(
  () => import('src/shared/components/FluxMonacoEditor')
)

const TaskPage: FC<Props> = props => {
  const {newScript, taskOptions, setTaskOption, clearTask} = props
  const showNewTasksUI = isFlagEnabled('tasksUiEnhancements')

  useEffect(() => {
    setTaskOption({
      key: 'taskScheduleType',
      value: TaskSchedule.interval,
    })
  }, [setTaskOption])

  useEffect(() => {
    clearTask()
  }, [clearTask])

  const isFormValid = () => {
    const {
      taskOptions: {name, cron, interval},
      newScript,
    } = props

    const hasSchedule = !!cron || !!interval
    return hasSchedule && !!name && !!newScript
  }

  const handleChangeScript = (script: string) => {
    props.setNewScript(script)
  }

  const handleChangeScheduleType = (value: TaskSchedule) => {
    props.setTaskOption({key: 'taskScheduleType', value})
  }

  const handleSave = () => {
    const {newScript, taskOptions} = props

    const taskOption: string = taskOptionsToFluxScript(taskOptions)
    let script: string = addDestinationToFluxScript(newScript, taskOptions)
    const preamble = `${taskOption}`

    // if the script has a pre-defined option task = {}
    // we want the taskOptions to take precedence over what is provided in the script
    // currently we delete that part of the script
    script = script.replace(new RegExp('option\\s+task\\s+=\\s+{(.|\\s)*}'), '')

    event('Valid Task Form Submitted')
    props.saveNewScript(script, preamble).then(() => {
      props.goToTasks()
    })
  }

  const handleCancel = () => {
    props.cancel()
  }

  const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target
    const key = name as TaskOptionKeys

    props.setTaskOption({key, value})
  }

  return (
    <Page titleTag={pageTitleSuffixer(['Create Task'])}>
      <Page.Header fullWidth={true}></Page.Header>
      <>
        <TaskHeader
          title="Create Task"
          canSubmit={isFormValid()}
          onCancel={handleCancel}
          onSave={handleSave}
          showNewTasksUI={showNewTasksUI}
        />
        {showNewTasksUI ? (
          <TaskScheduler
            taskOptions={taskOptions}
            onChangeScheduleType={handleChangeScheduleType}
            onChangeInput={handleChangeInput}
          />
        ) : (
          <Page.Contents fullWidth={true} scrollable={false}>
            <div className="task-form">
              <div className="task-form--options">
                <TaskForm
                  taskOptions={taskOptions}
                  canSubmit={isFormValid()}
                  onChangeInput={handleChangeInput}
                  onChangeScheduleType={handleChangeScheduleType}
                />
              </div>
              <div className="task-form--editor">
                <Suspense
                  fallback={
                    <SpinnerContainer
                      loading={RemoteDataState.Loading}
                      spinnerComponent={<TechnoSpinner />}
                    />
                  }
                >
                  <FluxMonacoEditor
                    script={newScript}
                    variables={props.variables}
                    onChangeScript={handleChangeScript}
                    autofocus
                  />
                </Suspense>
              </div>
            </div>
          </Page.Contents>
        )}
      </>
    </Page>
  )
}

const mstp = (state: AppState) => {
  const {tasks} = state.resources
  const {taskOptions, newScript} = tasks

  return {
    taskOptions,
    newScript,
    variables: getAllVariables(state),
  }
}

const mdtp = {
  setNewScript,
  saveNewScript,
  setTaskOption,
  clearTask,
  goToTasks,
  cancel,
}

const connector = connect(mstp, mdtp)

export default connector(TaskPage)
