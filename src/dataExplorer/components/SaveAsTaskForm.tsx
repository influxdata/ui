// Libraries
import React, {PureComponent, ChangeEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'

// Components
import TaskForm from 'src/tasks/components/TaskForm'

// Actions
import {saveNewScript, goToTasks} from 'src/tasks/actions/thunks'
import {
  setTaskOption,
  clearTask,
  setNewScript,
} from 'src/tasks/actions/creators'

// Utils
import {formatVarsOption} from 'src/variables/utils/formatVarsOption'
import {
  taskOptionsToFluxScript,
  addDestinationToFluxScript,
} from 'src/utils/taskOptionsToFluxScript'
import {getAllVariables, asAssignment} from 'src/variables/selectors'
import {getOrg} from 'src/organizations/selectors'
import {getActiveQuery} from 'src/timeMachine/selectors'

// Types
import {AppState, TaskSchedule, TaskOptionKeys} from 'src/types'

interface OwnProps {
  dismiss: () => void
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

class SaveAsTaskForm extends PureComponent<
  Props & RouteComponentProps<{orgID: string}>
> {
  public componentDidMount() {
    const {setTaskOption, setNewScript} = this.props

    setTaskOption({
      key: 'taskScheduleType',
      value: TaskSchedule.interval,
    })

    setNewScript(this.activeScript)
  }

  public componentWillUnmount() {
    const {clearTask} = this.props

    clearTask()
  }

  public render() {
    const {taskOptions, dismiss} = this.props

    return (
      <TaskForm
        taskOptions={taskOptions}
        onChangeScheduleType={this.handleChangeScheduleType}
        onChangeInput={this.handleChangeInput}
        onChangeToBucketName={this.handleChangeToBucketName}
        isInOverlay={true}
        onSubmit={this.handleSubmit}
        canSubmit={this.isFormValid}
        dismiss={dismiss}
      />
    )
  }

  private get isFormValid(): boolean {
    const {
      taskOptions: {name, cron, interval},
    } = this.props

    const hasSchedule = !!cron || !!interval

    return hasSchedule && !!name && !!this.activeScript
  }

  private get activeScript(): string {
    const {activeQuery} = this.props

    return activeQuery.text
  }

  private handleSubmit = () => {
    const {saveNewScript, newScript, taskOptions, goToTasks} = this.props

    // Don't embed variables that are not used in the script
    const vars = [...this.props.userDefinedVars].filter(assignment =>
      newScript.includes(assignment.id.name)
    )

    const varOption: string = formatVarsOption(vars) // option v = { ... }
    const taskOption: string = taskOptionsToFluxScript(taskOptions) // option task = { ... }
    const preamble = `${varOption}\n\n${taskOption}`
    const script = addDestinationToFluxScript(newScript, taskOptions)

    saveNewScript(script, preamble).then(() => {
      goToTasks()
    })
  }

  private handleChangeToBucketName = (bucketName: string) => {
    const {setTaskOption} = this.props

    setTaskOption({key: 'toBucketName', value: bucketName})
  }

  private handleChangeScheduleType = (taskScheduleType: TaskSchedule) => {
    const {setTaskOption} = this.props

    setTaskOption({key: 'taskScheduleType', value: taskScheduleType})
  }

  private handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const {setTaskOption} = this.props

    const key = e.target.name as TaskOptionKeys
    const value = e.target.value

    setTaskOption({key, value})
  }
}

const mstp = (state: AppState) => {
  const {newScript, taskOptions} = state.resources.tasks
  const activeQuery = getActiveQuery(state)
  const org = getOrg(state)
  const userDefinedVars = getAllVariables(state)
    .map(v => asAssignment(v))
    .filter(v => !!v)

  return {
    newScript,
    taskOptions: {...taskOptions, toOrgName: org.name},
    activeQuery,
    userDefinedVars,
  }
}

const mdtp = {
  saveNewScript,
  setTaskOption,
  clearTask,
  setNewScript,
  goToTasks,
}

const connector = connect(mstp, mdtp)

export default connector(withRouter(SaveAsTaskForm))
