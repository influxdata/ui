// Libraries
import React, {lazy, Suspense, PureComponent, ChangeEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {RouteComponentProps} from 'react-router-dom'
import {
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'

// Components
import TaskForm from 'src/tasks/components/TaskForm'
import TaskHeader from 'src/tasks/components/TaskHeader'
import {Page} from '@influxdata/clockface'

// Actions and Selectors
import {
  setCurrentScript,
  setTaskOption,
  clearTask,
} from 'src/tasks/actions/creators'
import {
  updateScript,
  selectTaskByID,
  cancel,
  setAllTaskOptionsByID,
} from 'src/tasks/actions/thunks'
import {getAllVariables} from 'src/variables/selectors'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Types
import {AppState, TaskOptionKeys, TaskSchedule} from 'src/types'

const FluxMonacoEditor = lazy(
  () => import('src/shared/components/FluxMonacoEditor')
)

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & RouteComponentProps<{id: string}>

class TaskEditPage extends PureComponent<Props> {
  constructor(props) {
    super(props)
  }

  public componentDidMount() {
    const {
      match: {
        params: {id},
      },
    } = this.props
    this.props.selectTaskByID(id)
    this.props.setAllTaskOptionsByID(id)
  }

  public componentWillUnmount() {
    this.props.clearTask()
  }

  public render(): JSX.Element {
    const {currentScript, currentTask, taskOptions} = this.props

    if (currentTask?.scriptID != null) {
      return (
        <Page titleTag={pageTitleSuffixer([`Edit ${taskOptions.name}`])}>
          <TaskHeader
            title="Scripted Task"
            canSubmit={false}
            onCancel={this.handleCancel}
            onSave={() => {}}
          />
          <Page.Contents fullWidth={true} scrollable={false}>
            <div className="task-form">
              <div className="task-form--options">
                <TaskForm
                  canSubmit={false}
                  taskOptions={taskOptions}
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
                    // Fill with a comment to avoid the syntax highlighting on the `or`
                    script="// You may not modify or save this task while it is using a script. Please use the API directly."
                    variables={null}
                    onChangeScript={this.handleChangeScript}
                    autofocus
                  />
                </Suspense>
              </div>
            </div>
          </Page.Contents>
        </Page>
      )
    }
    return (
      <Page titleTag={pageTitleSuffixer([`Edit ${taskOptions.name}`])}>
        <TaskHeader
          title="Edit Task"
          canSubmit={this.isFormValid}
          onCancel={this.handleCancel}
          onSave={this.handleSave}
        />
        <Page.Contents fullWidth={true} scrollable={false}>
          <div className="task-form">
            <div className="task-form--options">
              <TaskForm
                canSubmit={this.isFormValid}
                taskOptions={taskOptions}
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
                  script={currentScript}
                  variables={this.props.variables}
                  onChangeScript={this.handleChangeScript}
                  autofocus
                />
              </Suspense>
            </div>
          </div>
        </Page.Contents>
      </Page>
    )
  }

  private get isFormValid(): boolean {
    const {
      taskOptions: {name, cron, interval},
      currentScript,
    } = this.props

    const hasSchedule = !!cron || !!interval
    return hasSchedule && !!name && !!currentScript
  }

  private handleChangeScript = (script: string) => {
    this.props.setCurrentScript(script)
  }

  private handleChangeScheduleType = (schedule: TaskSchedule) => {
    this.props.setTaskOption({key: 'taskScheduleType', value: schedule})
  }

  private handleSave = () => {
    this.props.updateScript()
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
  const {taskOptions, currentScript, currentTask} = state.resources.tasks

  return {
    taskOptions,
    currentScript,
    currentTask,
    variables: getAllVariables(state),
  }
}

const mdtp = {
  setTaskOption,
  setCurrentScript,
  updateScript,
  cancel,
  selectTaskByID,
  setAllTaskOptionsByID,
  clearTask,
}

const connector = connect(mstp, mdtp)
export default connector(TaskEditPage)
