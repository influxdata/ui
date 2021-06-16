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
import {AppState, Run} from 'src/types'
import {SpinnerContainer, TechnoSpinner} from '@influxdata/clockface'

// Actions
import {getRuns, runTask, updateTaskStatus} from 'src/tasks/actions/thunks'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Types
import {SortTypes} from 'src/shared/utils/sort'
import TimeZoneDropdown from 'src/shared/components/TimeZoneDropdown'

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
    const {match, runs, currentTask} = this.props
    const {sortKey, sortDirection, sortType} = this.state

    return (
      <SpinnerContainer
        loading={this.props.runStatus}
        spinnerComponent={<TechnoSpinner />}
      >
        <Page titleTag={pageTitleSuffixer(['Task Runs'])}>
          <Page.Header fullWidth={false}>
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
            <RateLimitAlert />
          </Page.Header>
          <Page.ControlBar fullWidth={false}>
            <TaskRunsCard
              task={currentTask}
              onActivate={this.handleActivate}
              onEditTask={this.handleEditTask}
            />
          </Page.ControlBar>
          <Page.ControlBar fullWidth={false}>
            <Page.ControlBarRight>
              <TimeZoneDropdown />
            </Page.ControlBarRight>
          </Page.ControlBar>
          <Page.Contents fullWidth={false} scrollable={true}>
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

  private handleClickColumn = (nextSort: Sort, sortKey: SortKey) => {
    let sortType = SortTypes.String

    if (sortKey !== 'status') {
      sortType = SortTypes.Date
    }

    this.setState({sortKey, sortDirection: nextSort, sortType})
  }

  private goBackToTasksPage = () => {
    const {history, currentTask} = this.props

    history.push(`orgs/${currentTask.orgID}/tasks`)
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

  private handleActivate = (task: any) => {
    this.props.updateTaskStatus(task)
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
  updateTaskStatus,
  getRuns,
  onRunTask: runTask,
}

const connector = connect(mstp, mdtp)

export default connector(withRouter(TaskRunsPage))
