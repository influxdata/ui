// Libraries
import React, {PureComponent, MouseEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'

import {
  pushPinnedItem,
  PinnedItemTypes,
  deletePinnedItemByParam,
  updatePinnedItemByParam,
} from 'src/shared/contexts/pinneditems'

// Components
import {
  SlideToggle,
  ComponentSize,
  ResourceCard,
  IconFont,
  InputLabel,
  FlexBox,
  AlignItems,
  FlexDirection,
} from '@influxdata/clockface'
import {Context} from 'src/clockface'
import InlineLabels from 'src/shared/components/inlineLabels/InlineLabels'
import LastRunTaskStatus from 'src/shared/components/lastRunTaskStatus/LastRunTaskStatus'
import {CopyResourceID} from 'src/shared/components/CopyResourceID'

// Actions
import {addTaskLabel, deleteTaskLabel} from 'src/tasks/actions/thunks'
import {setCurrentTasksPage} from 'src/tasks/actions/creators'

// Types
import {ComponentColor} from '@influxdata/clockface'
import {Task, Label, AppState} from 'src/types'

// Constants
import {DEFAULT_TASK_NAME} from 'src/dashboards/constants'
import {getMe} from 'src/me/selectors'
import {getOrg} from 'src/organizations/selectors'

interface PassedProps {
  task: Task
  onActivate: (task: Task) => void
  onDelete: (task: Task) => void
  onClone: (task: Task) => void
  onRunTask: (taskID: string) => void
  onUpdate: (name: string, taskID: string) => void
  onFilterChange: (searchTerm: string) => void
  isPinned: boolean
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = PassedProps & ReduxProps

export class TaskCard extends PureComponent<
  Props & RouteComponentProps<{orgID: string}>
> {
  public render() {
    const {task} = this.props

    return (
      <ResourceCard
        testID="task-card"
        disabled={!this.isTaskActive}
        contextMenu={this.contextMenu}
        alignItems={AlignItems.Center}
        margin={ComponentSize.Large}
        direction={FlexDirection.Row}
      >
        <LastRunTaskStatus
          lastRunError={task.lastRunError}
          lastRunStatus={task.lastRunStatus}
        />
        <FlexBox
          alignItems={AlignItems.FlexStart}
          direction={FlexDirection.Column}
          margin={ComponentSize.Medium}
        >
          <ResourceCard.EditableName
            onClick={this.handleNameClick}
            onUpdate={this.handleRenameTask}
            name={task.name}
            noNameString={DEFAULT_TASK_NAME}
            testID="task-card--name"
            buttonTestID="task-card--name-button"
            inputTestID="task-card--input"
          />
          <ResourceCard.Meta>
            {this.activeToggle}
            <>Last completed at {task.latestCompleted}</>
            <>{`Scheduled to run ${this.schedule}`}</>
            <CopyResourceID resource={task} resourceName="Task" />
          </ResourceCard.Meta>
          {this.labels}
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

  private handlePinTask = async () => {
    await pushPinnedItem({
      orgID: this.props.org.id,
      userID: this.props.me.id,
      metadata: {
        taskID: this.props.task.id,
        name: this.props.task.name,
      },
      type: PinnedItemTypes.Task,
    })
  }

  private handleOnDelete = async () => {
    this.props.onDelete(this.props.task)
    await deletePinnedItemByParam(this.props.task.id)
  }
  private get contextMenu(): JSX.Element {
    const {task, onClone, isPinned} = this.props

    return (
      <Context>
        <Context.Menu icon={IconFont.CogThick} testID="context-cog-runs">
          <Context.Item label="Export" action={this.handleExport} />
          <Context.Item
            label="Edit Task"
            action={this.handleEditTask}
            testID="context-edit-task"
          />
          <Context.Item
            label="Run Task"
            action={this.handleRunTask}
            value={task.id}
          />
        </Context.Menu>
        <Context.Menu
          icon={IconFont.Duplicate}
          color={ComponentColor.Secondary}
        >
          <Context.Item label="Clone" action={onClone} value={task} />
        </Context.Menu>
        <Context.Menu
          icon={IconFont.Star}
          color={ComponentColor.Success}
          testID="context-pin-menu"
        >
          <Context.Item
            label="Pin to Homepage"
            action={async () => await this.handlePinTask()}
            testID="context-pin-task"
            disabled={isPinned}
          />
        </Context.Menu>
        <Context.Menu
          icon={IconFont.Trash}
          color={ComponentColor.Danger}
          testID="context-delete-menu"
        >
          <Context.Item
            label="Delete"
            action={this.handleOnDelete}
            value={task}
            testID="context-delete-task"
          />
        </Context.Menu>
      </Context>
    )
  }

  private handleNameClick = (event: MouseEvent) => {
    const {
      history,
      task,
      match: {
        params: {orgID},
      },
    } = this.props
    const url = `/orgs/${orgID}/tasks/${task.id}/runs`

    if (event.metaKey) {
      window.open(url, '_blank', 'noopener')
    } else {
      history.push(url)
    }
  }

  private handleRunTask = (taskId: string) => {
    const {
      onRunTask,
      history,
      match: {
        params: {orgID},
      },
    } = this.props
    try {
      onRunTask(taskId)
      history.push(`/orgs/${orgID}/tasks/${taskId}/runs`)
    } catch (error) {
      console.error(error)
    }
  }

  private handleEditTask = () => {
    const {
      match: {
        params: {orgID},
      },
      history,
      task,
    } = this.props

    history.push(`/orgs/${orgID}/tasks/${task.id}/edit`)
  }

  private handleRenameTask = (name: string) => {
    const {
      onUpdate,
      task: {id},
    } = this.props
    onUpdate(name, id)
    updatePinnedItemByParam(id, {name})
  }

  private handleExport = () => {
    const {
      history,
      task,
      location: {pathname},
    } = this.props
    history.push(`${pathname}/${task.id}/export`)
  }

  private get labels(): JSX.Element {
    const {task, onFilterChange} = this.props

    return (
      <InlineLabels
        selectedLabelIDs={task.labels}
        onFilterChange={onFilterChange}
        onAddLabel={this.handleAddLabel}
        onRemoveLabel={this.handleRemoveLabel}
      />
    )
  }

  private handleAddLabel = (label: Label) => {
    const {task, onAddTaskLabel} = this.props

    onAddTaskLabel(task.id, label)
  }

  private handleRemoveLabel = (label: Label) => {
    const {task, onDeleteTaskLabel} = this.props

    onDeleteTaskLabel(task.id, label)
  }

  private get isTaskActive(): boolean {
    const {task} = this.props
    if (task.status === 'active') {
      return true
    }
    return false
  }

  private changeToggle = () => {
    const {onActivate} = this.props
    const task = {...this.props.task}
    task.status = task.status === 'active' ? 'inactive' : 'active'
    onActivate(task)
  }

  private get schedule(): string {
    const {task} = this.props
    if (task.every && task.offset) {
      return `every ${task.every}, offset ${task.offset}`
    }
    if (task.every) {
      return `every ${task.every}`
    }
    if (task.cron) {
      return task.cron
    }
    return ''
  }
}

const mdtp = {
  onAddTaskLabel: addTaskLabel,
  onDeleteTaskLabel: deleteTaskLabel,
  setCurrentTasksPage,
}

const mstp = (state: AppState) => {
  const me = getMe(state)
  const org = getOrg(state)

  return {
    org,
    me,
  }
}
const connector = connect(mstp, mdtp)

export default connector(withRouter(TaskCard))
