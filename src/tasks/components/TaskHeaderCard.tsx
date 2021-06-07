// Libraries
import React, {PureComponent, MouseEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'

// Components
import {
  Page,
  SlideToggle,
  ComponentSize,
  ResourceCard,
  IconFont,
  InputLabel,
  FlexBox,
  AlignItems,
  FlexDirection,
  JustifyContent,
} from '@influxdata/clockface'
import {Context} from 'src/clockface'
import InlineLabels from 'src/shared/components/inlineLabels/InlineLabels'
import LastRunTaskStatus from 'src/shared/components/lastRunTaskStatus/LastRunTaskStatus'
import {CopyResourceID} from 'src/shared/components/CopyResourceID'

// Actions
import {addTaskLabel, deleteTaskLabel, runTask, getRuns, updateTask} from 'src/tasks/actions/thunks'

// Types
import {ComponentColor, Button} from '@influxdata/clockface'
import {Task, Label, AppState, Run} from 'src/types'

// Constants
import {DEFAULT_TASK_NAME} from 'src/dashboards/constants'

interface PassedProps {
  task: Task
  onActivate: (task: Task) => void
  onRunTask: (taskID: string) => void
  // onUpdate: (name: string, taskID: string) => void
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = PassedProps & ReduxProps

export class TaskHeaderCard extends PureComponent<
  Props & RouteComponentProps<{orgID: string}>
> {
  public render() {
    const {task} = this.props

    if (!task) {
      return null
    }
    console.log("random",task)

    return (
      <ResourceCard
        testID="task-card"
        disabled={!this.isTaskActive}
        alignItems={AlignItems.Center}
        margin={ComponentSize.Large}
        direction={FlexDirection.Row}
      >
        <FlexBox
          alignItems={AlignItems.FlexStart}
          direction={FlexDirection.Column}
          margin={ComponentSize.Large}
          style={{ width: '50%' }}
        >
          <ResourceCard.Name
            name={task.name}
            testID="task-card--name"
          />
          <ResourceCard.Meta>
            {this.activeToggle}
            <>Created at: {task.createdAt}</>
            <>Created by: {task.name}</>
            <>Last Used: {task.updatedAt}</>
            <>{task.org}</>
            {/* <CopyResourceID resource={task} resourceName="Task" /> */}
          </ResourceCard.Meta>
          
        </FlexBox>

        <FlexBox
          justifyContent={JustifyContent.FlexEnd}
          direction={FlexDirection.Row}
          style={{ width: '50%' }}
        >
          {/* <Page.ControlBar fullWidth={true}> */}
            {/* <Page.ControlBarRight> */}
              <Button
                onClick={this.handleRunTask}
                text="Run Task"
                style={{ marginRight: 10 }}
              />
              <Button
                onClick={this.handleEditTask}
                text="Edit Task"
                color={ComponentColor.Primary}
              />
            {/* </Page.ControlBarRight> */}
          {/* </Page.ControlBar> */}
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

  // public componentDidMount() {
  //   this.props.getRuns(this.props.match.params.id)
  // }
  
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

  // private get contextMenu(): JSX.Element {
  //   const {task, onClone, onDelete} = this.props

  //   return (
  //     <Context>
  //       <Context.Menu icon={IconFont.CogThick} testID="context-cog-runs">
  //         <Context.Item label="Export" action={this.handleExport} />
  //         <Context.Item
  //           label="View Task Runs"
  //           action={this.handleViewRuns}
  //           testID="context-view-task-runs"
  //         />
  //         <Context.Item
  //           label="Run Task"
  //           action={this.handleRunTask}
  //           value={task.id}
  //         />
  //       </Context.Menu>
  //       <Context.Menu
  //         icon={IconFont.Duplicate}
  //         color={ComponentColor.Secondary}
  //       >
  //         <Context.Item label="Clone" action={onClone} value={task} />
  //       </Context.Menu>
  //       <Context.Menu
  //         icon={IconFont.Trash}
  //         color={ComponentColor.Danger}
  //         testID="context-delete-menu"
  //       >
  //         <Context.Item
  //           label="Delete"
  //           action={onDelete}
  //           value={task}
  //           testID="context-delete-task"
  //         />
  //       </Context.Menu>
  //     </Context>
  //   )
  // }

  // private handleNameClick = (event: MouseEvent) => {
  //   const {
  //     match: {
  //       params: {orgID},
  //     },
  //     history,
  //     task,
  //   } = this.props
  //   const url = `/orgs/${orgID}/tasks/${task.id}/edit`

  //   if (event.metaKey) {
  //     window.open(url, '_blank')
  //   } else {
  //     history.push(url)
  //   }
  // }

  // private handleRunTask = (taskId: string) => {
  //   const {
  //     onRunTask,
  //     history,
  //     match: {
  //       params: {orgID},
  //     },
  //   } = this.props
  //   try {
  //     onRunTask(taskId)
  //     history.push(`/orgs/${orgID}/tasks/${taskId}/runs`)
  //   } catch (error) {
  //     console.error(error)
  //   }
  // }

  // private handleViewRuns = () => {
  //   const {
  //     history,
  //     task,
  //     match: {
  //       params: {orgID},
  //     },
  //   } = this.props
  //   history.push(`/orgs/${orgID}/tasks/${task.id}/runs`)
  // }

  // private handleRenameTask = (name: string) => {
  //   const {
  //     onUpdate,
  //     task: {id},
  //   } = this.props
  //   onUpdate(name, id)
  // }

  // private handleExport = () => {
  //   const {
  //     history,
  //     task,
  //     location: {pathname},
  //   } = this.props
  //   history.push(`${pathname}/${task.id}/export`)
  // }

  // private get labels(): JSX.Element {
  //   const {task, onFilterChange} = this.props

  //   return (
  //     <InlineLabels
  //       selectedLabelIDs={task.labels}
  //       onFilterChange={onFilterChange}
  //       onAddLabel={this.handleAddLabel}
  //       onRemoveLabel={this.handleRemoveLabel}
  //     />
  //   )
  // }

  // private handleAddLabel = (label: Label) => {
  //   const {task, onAddTaskLabel} = this.props

  //   onAddTaskLabel(task.id, label)
  // }

  // private handleRemoveLabel = (label: Label) => {
  //   const {task, onDeleteTaskLabel} = this.props

  //   onDeleteTaskLabel(task.id, label)
  // }

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
  getRuns
}

const connector = connect(mstp, mdtp)

export default connector(withRouter(TaskHeaderCard))
