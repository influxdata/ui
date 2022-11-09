// Libraries
import React, {lazy, Suspense, PureComponent, ChangeEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'

// Components
import {Page} from '@influxdata/clockface'
import TaskForm from 'src/tasks/components/TaskForm'
import TaskHeader from 'src/tasks/components/TaskHeader'
import {TaskScheduler} from 'src/tasks/components/TaskScheduler/TaskScheduler'

// Constants
import {CLOUD} from 'src/shared/constants'

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
  addDestinationToFluxScript,
  taskOptionsToFluxScript,
} from 'src/utils/taskOptionsToFluxScript'
import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Types
import {AppState, TaskOptionKeys, TaskSchedule} from 'src/types'

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps

const FluxMonacoEditor = lazy(
  () => import('src/shared/components/FluxMonacoEditor')
)

class TaskPage extends PureComponent<Props> {
  constructor(props) {
    super(props)
  }

  public componentDidMount() {
    this.props.setTaskOption({
      key: 'taskScheduleType',
      value: TaskSchedule.interval,
    })
  }

  public componentWillUnmount() {
    this.props.clearTask()
  }

  public render(): JSX.Element {
    const {newScript, taskOptions} = this.props
    const shouldShowNewTasksUI = isFlagEnabled('tasksUiEnhancements') && CLOUD

    return (
      <Page titleTag={pageTitleSuffixer(['Create Task'])}>
        <TaskHeader
          title="Create Task"
          canSubmit={this.isFormValid}
          onCancel={this.handleCancel}
          onSave={this.handleSave}
          showControlBar={!shouldShowNewTasksUI}
        />
        {shouldShowNewTasksUI ? (
          <TaskScheduler
            taskOptions={taskOptions}
            updateScheduleType={this.handleChangeScheduleType}
            updateInput={this.handleChangeInput}
          />
        ) : (
          <Page.Contents fullWidth={true} scrollable={false}>
            <div className="task-form">
              <div className="task-form--options">
                <TaskForm
                  taskOptions={taskOptions}
                  canSubmit={this.isFormValid}
                  onChangeInput={this.handleChangeInput}
                  onChangeScheduleType={this.handleChangeScheduleType}
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
                    variables={this.props.variables}
                    onChangeScript={this.handleChangeScript}
                    autofocus
                  />
                </Suspense>
              </div>
            </div>
          </Page.Contents>
        )}
      </Page>
    )
  }

  private get isFormValid(): boolean {
    const {
      taskOptions: {name, cron, interval},
      newScript,
    } = this.props

    const hasSchedule = !!cron || !!interval
    return hasSchedule && !!name && !!newScript
  }

  private handleChangeScript = (script: string) => {
    this.props.setNewScript(script)
  }

  private handleChangeScheduleType = (value: TaskSchedule) => {
    this.props.setTaskOption({key: 'taskScheduleType', value})
  }

  private handleSave = () => {
    const {newScript, taskOptions} = this.props

    const taskOption: string = taskOptionsToFluxScript(taskOptions)
    let script: string = addDestinationToFluxScript(newScript, taskOptions)
    const preamble = `${taskOption}`

    // if the script has a pre-defined option task = {}
    // we want the taskOptions to take precedence over what is provided in the script
    // currently we delete that part of the script
    script = script.replace(new RegExp('option\\s+task\\s+=\\s+{(.|\\s)*}'), '')

    event('Valid Task Form Submitted')
    this.props.saveNewScript(script, preamble).then(() => {
      this.props.goToTasks()
    })
  }

  private handleCancel = () => {
    this.props.cancel()
  }

  private handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target
    const key = name as TaskOptionKeys

    this.props.setTaskOption({key, value})
  }
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
