// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'

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

// Actions For Tasks
import {relativeTimestampFormatter} from 'src/shared/utils/relativeTimestampFormatter'

// Actions
import {
  addTaskLabel,
  deleteTaskLabel,
  runTask,
  getRuns,
} from 'src/tasks/actions/thunks'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Actions For Members
import {getMembers} from 'src/members/actions/thunks'

import {TaskPage, setCurrentTasksPage} from 'src/tasks/actions/creators'

// Types
import {ComponentColor, Button} from '@influxdata/clockface'
import {Task, AppState} from 'src/types'

// DateTime
import {DEFAULT_TIME_FORMAT} from 'src/utils/datetime/constants'
import {FormattedDateTime} from 'src/utils/datetime/FormattedDateTime'
interface PassedProps {
  task: Task
  onActivate: (task: Task) => void
  onEditTask: () => void
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = PassedProps & ReduxProps

class UnconnectedTaskRunsCard extends PureComponent<
  Props & RouteComponentProps<{orgID: string; id: string}>
> {
  componentDidMount() {
    this.props.getMembers()
  }

  public render() {
    const {task} = this.props

    if (!task) {
      return null
    }
    return (
      <ResourceCard
        testID="task-runs-task-card"
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
            <>
              Created at:{' '}
              <FormattedDateTime
                format={DEFAULT_TIME_FORMAT}
                date={new Date(task.createdAt)}
              />
            </>
            <>Created by: {this.ownerName}</>
            <>Last Used: {relativeTimestampFormatter(task.latestCompleted)}</>
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

  private get ownerName(): string {
    const {task, members} = this.props

    if (members[task.ownerID]) {
      return members[task.ownerID].name
    }
    return ''
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

  private handleRunTask = async () => {
    const {onRunTask, match, getRuns} = this.props
    try {
      await onRunTask(match.params.id)
      await getRuns(match.params.id)
    } catch (error) {
      console.error(error)
    }
  }

  private handleEditTask = () => {
    const {
      history,
      task,
      setCurrentTasksPage,
      match: {
        params: {orgID},
      },
    } = this.props

    if (isFlagEnabled('createWithFlows')) {
      history.push(`/notebook/from/task/${task.id}`)
      return
    }

    setCurrentTasksPage(TaskPage.TaskRunsPage)
    history.push(`/orgs/${orgID}/tasks/${task.id}/edit`)
  }

  private get isTaskActive(): boolean {
    const {task} = this.props
    return task.status === 'active'
  }

  private changeToggle = () => {
    const {onActivate} = this.props
    const task = {...this.props.task}
    task.status = task.status === 'active' ? 'inactive' : 'active'
    onActivate(task)
  }
}

const mstp = (state: AppState) => {
  const {runs, runStatus} = state.resources.tasks
  const {byID} = state.resources.members

  return {
    runs,
    runStatus,
    members: byID,
  }
}

const mdtp = {
  onAddTaskLabel: addTaskLabel,
  onDeleteTaskLabel: deleteTaskLabel,
  onRunTask: runTask,
  getRuns,
  setCurrentTasksPage,
  getMembers,
}

const connector = connect(mstp, mdtp)

export const TaskRunsCard = connector(withRouter(UnconnectedTaskRunsCard))
