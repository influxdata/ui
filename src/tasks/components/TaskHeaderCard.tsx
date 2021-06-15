// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import moment from 'moment'

// Components
import {
  SlideToggle,
  ComponentSize,
  ResourceCard,
  InputLabel,
  FlexBox,
  AlignItems,
  FlexDirection,
  JustifyContent,
} from '@influxdata/clockface'

// Actions
import {
  addTaskLabel,
  deleteTaskLabel,
  runTask,
  getRuns,
  // setTaskRunsPageAsCurrent,
} from 'src/tasks/actions/thunks'

// Types
import {ComponentColor, Button} from '@influxdata/clockface'
import {Task, AppState} from 'src/types'

interface PassedProps {
  task: Task
  onActivate: (task: Task) => void
  onEditTask: () => void
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = PassedProps & ReduxProps

export class TaskHeaderCard extends PureComponent<
  Props & RouteComponentProps<{orgID: string; id: string}>
> {
  public render() {
    const {task} = this.props

    if (!task) {
      return null
    }

    return (
      <ResourceCard
        testID="task-card"
        disabled={!this.isTaskActive}
        alignItems={AlignItems.Center}
        margin={ComponentSize.Large}
        direction={FlexDirection.Row}
        justifyContent={JustifyContent.SpaceBetween}
      >
        <FlexBox
          alignItems={AlignItems.FlexStart}
          direction={FlexDirection.Column}
          margin={ComponentSize.Large}
        >
          <ResourceCard.Name name={task.name} testID="task-card--name" />
          <ResourceCard.Meta>
            {this.activeToggle}
            <>Created at: {task.createdAt}</>
            <>Created by: {task.name}</>
            <>Last Used: {moment(task.latestCompleted).fromNow()}</>
            <>{task.org}</>
          </ResourceCard.Meta>
        </FlexBox>

        <FlexBox margin={ComponentSize.Medium} direction={FlexDirection.Row}>
          <Button onClick={this.handleRunTask} text="Run Task" />
          <Button
            onClick={this.handleEditTask}
            text="Edit Task"
            color={ComponentColor.Primary}
          />
        </FlexBox>
      </ResourceCard>
    )
  }

  private get activeToggle(): JSX.Element {
    const labelText = this.isTaskActive ? 'Active' : 'Inactive'
    return (
      <FlexBox margin={ComponentSize.Small}>
        <SlideToggle
          active={this.isTaskActive}
          size={ComponentSize.ExtraSmall}
          onChange={this.changeToggle}
          testID="task-card--slide-toggle"
        />
        <InputLabel active={this.isTaskActive}>{labelText}</InputLabel>
      </FlexBox>
    )
  }

  private handleRunTask = () => {
    const {onRunTask, match, getRuns} = this.props
    try {
      onRunTask(match.params.id)
      getRuns(match.params.id)
    } catch (error) {
      console.error(error)
    }
  }

  private handleEditTask = () => {
    const {
      history,
      currentTask,
      match: {
        params: {orgID},
      },
    } = this.props

    history.push(`/orgs/${orgID}/tasks/${currentTask.id}/edit`)
  }

  private get isTaskActive(): boolean {
    const {task} = this.props
    if (task.status === 'active') {
      return true
    }
    return false
  }

  private changeToggle = () => {
    const {task, onActivate} = this.props
    if (task.status === 'active') {
      task.status = 'inactive'
    } else {
      task.status = 'active'
    }
    onActivate(task)
  }
}

const mstp = (state: AppState) => {
  const {runs, runStatus, currentTask} = state.resources.tasks

  return {
    runs,
    runStatus,
    currentTask,
  }
}

const mdtp = {
  onAddTaskLabel: addTaskLabel,
  onDeleteTaskLabel: deleteTaskLabel,
  onRunTask: runTask,
  getRuns,
}

const connector = connect(mstp, mdtp)

export default connector(withRouter(TaskHeaderCard))
