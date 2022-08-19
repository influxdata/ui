// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'

// Components
import {Page, Sort} from '@influxdata/clockface'
import TaskRunsList from 'src/tasks/components/TaskRunsList'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'
import {TaskRunsCard} from 'src/tasks/components/TaskRunsCard'
import {PageBreadcrumbs} from 'src/tasks/components/PageBreadcrumbs'

// Types
import {AppState, ResourceType, Run, Task} from 'src/types'
import {SpinnerContainer, TechnoSpinner} from '@influxdata/clockface'

// Actions
import {getRuns, runTask, getAllTasks} from 'src/tasks/actions/thunks'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Types
import {SortTypes} from 'src/shared/utils/sort'
import TimeZoneDropdown from 'src/shared/components/TimeZoneDropdown'
import {getAll} from 'src/resources/selectors'

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & RouteComponentProps<{id: string; orgID: string}>

interface State {
  sortKey: SortKey
  sortDirection: Sort
  sortType: SortTypes
}

type SortKey = keyof Run

class TaskRunsPage extends PureComponent<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      sortKey: 'scheduledFor',
      sortDirection: Sort.Descending,
      sortType: SortTypes.Date,
    }
  }

  public render() {
    const {match, runs, currentTask, isTaskEditable} = this.props
    const {sortKey, sortDirection, sortType} = this.state

    return (
      <SpinnerContainer
        loading={this.props.runStatus}
        spinnerComponent={<TechnoSpinner />}
      >
        <Page titleTag={pageTitleSuffixer(['Task Runs'])}>
          <Page.Header fullWidth={true}>
            <PageBreadcrumbs
              pages={[
                {
                  text: 'Tasks',
                  onClick: this.goBackToTasksPage,
                },
                {
                  text: currentTask ? `${currentTask.name}  Runs` : '',
                },
              ]}
            />
            <RateLimitAlert location="task runs" />
          </Page.Header>
          <Page.ControlBar fullWidth={true}>
            <TaskRunsCard task={currentTask} isTaskEditable={isTaskEditable} />
          </Page.ControlBar>
          <Page.ControlBar fullWidth={true}>
            <Page.ControlBarRight>
              <TimeZoneDropdown />
            </Page.ControlBarRight>
          </Page.ControlBar>
          <Page.Contents fullWidth={true} scrollable={true}>
            <TaskRunsList
              taskID={match.params.id}
              runs={runs}
              sortKey={sortKey}
              sortDirection={sortDirection}
              sortType={sortType}
              onClickColumn={this.handleClickColumn}
            />
          </Page.Contents>
        </Page>
      </SpinnerContainer>
    )
  }

  public componentDidMount() {
    this.props.getRuns(this.props.match.params.id)
  }

  public componentDidUpdate(prevProps: Readonly<Props>): void {
    if (!prevProps.currentTask && !!this.props.currentTask) {
      // once we have the currentTask, ask the /tasks API if this task is editable
      this.props.getAllTasks(this.props.currentTask.name)
    }
  }

  private handleClickColumn = (nextSort: Sort, sortKey: SortKey) => {
    let sortType = SortTypes.String

    if (sortKey !== 'status') {
      sortType = SortTypes.Date
      if (sortKey === 'duration') {
        sortType = SortTypes.Float
      }
    }

    this.setState({sortKey, sortDirection: nextSort, sortType})
  }

  private goBackToTasksPage = () => {
    const {history, currentTask} = this.props

    history.push(`orgs/${currentTask.orgID}/tasks`)
  }
}

const mstp = (state: AppState) => {
  const tasksFilteredByName = getAll<Task>(state, ResourceType.Tasks)
  const {currentTask, runs, runStatus} = state.resources.tasks

  // this task is only editable if the /tasks API returns it.
  // tasks created by an Alert are uneditable and are not returned from /tasks API.
  const isTaskEditable = currentTask
    ? !!tasksFilteredByName.find(t => t.id === currentTask.id)
    : false

  return {
    runs,
    runStatus,
    currentTask,
    isTaskEditable,
  }
}

const mdtp = {
  getRuns,
  getAllTasks,
  onRunTask: runTask,
}

const connector = connect(mstp, mdtp)

export default connector(withRouter(TaskRunsPage))
