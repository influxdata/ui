// Libraries
import React, {PureComponent, RefObject, createRef} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'

import {
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
  SquareButton,
  Popover,
  Appearance,
  List,
  ButtonShape,
  ConfirmationButton,
} from '@influxdata/clockface'
import InlineLabels from 'src/shared/components/inlineLabels/InlineLabels'
import LastRunTaskStatus from 'src/shared/components/lastRunTaskStatus/LastRunTaskStatus'
import {CopyResourceID} from 'src/shared/components/CopyResourceID'

// Actions
import {addTaskLabel, deleteTaskLabel} from 'src/tasks/actions/thunks'
import {setCurrentTasksPage} from 'src/tasks/actions/creators'

// Types
import {ComponentColor} from '@influxdata/clockface'
import {Task, Label} from 'src/types'

// Constants
import {DEFAULT_TASK_NAME} from 'src/dashboards/constants'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {CLOUD} from 'src/shared/constants'

import {
  pinnedItemFailure,
  pinnedItemSuccess,
} from 'src/shared/copy/notifications'
import {notify} from 'src/shared/actions/notifications'
import {downloadTaskTemplate} from 'src/tasks/apis'
import {event} from 'src/cloud/utils/reporting'
import {shouldOpenLinkInNewTab} from 'src/utils/crossPlatform'
import {safeBlankLinkOpen} from 'src/utils/safeBlankLinkOpen'

interface PassedProps {
  task: Task
  onActivate: (task: Task) => void
  onDelete: (task: Task) => void
  onClone: (task: Task) => void
  onRunTask: (taskID: string) => void
  onUpdate: (name: string, taskID: string) => void
  onFilterChange: (searchTerm: string) => void
  onPinTask: (taskID: string, name: string) => void
  onUnpinTask: (taskID: string) => void
  isPinned: boolean
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = PassedProps & ReduxProps

export class TaskCard extends PureComponent<
  Props & RouteComponentProps<{orgID: string}>
> {
  public render() {
    const {
      task,
      history,
      match: {
        params: {orgID},
      },
    } = this.props

    const taskUrl = `/orgs/${orgID}/tasks/${task.id}/runs`

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
          statusButtonClickHandler={() => {
            event('check status button clicked', {
              lastRunError: task.lastRunError,
              lastRunStatus: task.lastRunStatus,
              from: 'task card',
            })
            if (isFlagEnabled('navToTaskRuns')) {
              history.push(`/orgs/${task.orgID}/tasks/${task.id}/runs`)
            }
          }}
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
            href={taskUrl}
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

  private handlePinTask = () => {
    const {task, isPinned} = this.props

    if (isPinned) {
      this.props.onUnpinTask(task.id)
    } else {
      this.props.onPinTask(task.id, task.name)
    }
  }

  private handleOnDelete = async task => {
    this.props.onDelete(task)
    try {
      await deletePinnedItemByParam(task.id)
    } catch (error) {
      this.props.sendNotification(pinnedItemFailure(error.message, 'delete'))
    }
  }
  private get contextMenu(): JSX.Element {
    const {task, onClone, isPinned} = this.props
    const settingsRef: RefObject<HTMLButtonElement> = createRef()

    return (
      <FlexBox margin={ComponentSize.ExtraSmall}>
        <ConfirmationButton
          color={ComponentColor.Colorless}
          icon={IconFont.Trash_New}
          shape={ButtonShape.Square}
          size={ComponentSize.ExtraSmall}
          confirmationLabel="Yes, delete this task"
          onConfirm={() => {
            this.handleOnDelete(task)
          }}
          confirmationButtonText="Confirm"
          testID={`context-delete-menu ${task.name}`}
        />
        <SquareButton
          ref={settingsRef}
          size={ComponentSize.ExtraSmall}
          icon={IconFont.CogSolid_New}
          color={ComponentColor.Colorless}
          testID="context-menu-task"
        />
        <Popover
          appearance={Appearance.Outline}
          enableDefaultStyles={false}
          style={{minWidth: '112px'}}
          contents={onHide => (
            <List>
              <List.Item
                onClick={this.handleExport}
                size={ComponentSize.Small}
                style={{fontWeight: 500}}
                testID="context-export-task"
              >
                Export
              </List.Item>
              <List.Item
                onClick={this.handleEditTask}
                size={ComponentSize.Small}
                style={{fontWeight: 500}}
                testID="context-edit-task"
              >
                Edit
              </List.Item>
              <List.Item
                value={task.id}
                onClick={this.handleRunTask}
                size={ComponentSize.Small}
                style={{fontWeight: 500}}
                testID="context-run-task"
              >
                Run
              </List.Item>
              <List.Item
                value={task}
                onClick={onClone}
                size={ComponentSize.Small}
                style={{fontWeight: 500}}
                testID="context-clone-task"
              >
                Clone
              </List.Item>
              {isFlagEnabled('pinnedItems') && CLOUD && (
                <List.Item
                  onClick={() => {
                    this.handlePinTask()
                    onHide()
                  }}
                  size={ComponentSize.Small}
                  style={{fontWeight: 500}}
                  testID="context-pin-task"
                >
                  {isPinned ? 'Unpin' : 'Pin'}
                </List.Item>
              )}
            </List>
          )}
          triggerRef={settingsRef}
        />
      </FlexBox>
    )
  }

  private handleNameClick = (event: React.MouseEvent) => {
    const {
      history,
      task,
      match: {
        params: {orgID},
      },
    } = this.props
    const taskUrl = `/orgs/${orgID}/tasks/${task.id}/runs`

    if (shouldOpenLinkInNewTab(event)) {
      safeBlankLinkOpen(taskUrl)
    } else {
      history.push(taskUrl)
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
    if (isFlagEnabled('pinnedItems') && CLOUD && this.props.isPinned) {
      try {
        updatePinnedItemByParam(id, {name})
        this.props.sendNotification(pinnedItemSuccess('task', 'updated'))
      } catch (err) {
        this.props.sendNotification(pinnedItemFailure(err.message, 'update'))
      }
    }
  }

  private handleExport = () => {
    const {task} = this.props
    downloadTaskTemplate(task)
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
  sendNotification: notify,
}

const connector = connect(null, mdtp)

export default connector(withRouter(TaskCard))
