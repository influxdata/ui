// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'

// Components
import {Page, IconFont, Sort} from '@influxdata/clockface'
import TaskRunsList from 'src/tasks/components/TaskRunsList'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'

// Types
import {AppState, Run} from 'src/types'
import {
  SpinnerContainer,
  TechnoSpinner,
  Button,
  ComponentColor,
} from '@influxdata/clockface'

// Actions
import {getRuns, runTask} from 'src/tasks/actions/thunks'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Types
import {SortTypes} from 'src/shared/utils/sort'

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
    const {match, runs} = this.props
    const {sortKey, sortDirection, sortType} = this.state

    return (
      <SpinnerContainer
        loading={this.props.runStatus}
        spinnerComponent={<TechnoSpinner />}
      >
        <Page titleTag={pageTitleSuffixer(['Task Runs'])}>
          <Page.Header fullWidth={false}>
            <Page.Title title={this.title} />
            <RateLimitAlert />
          </Page.Header>
          <Page.ControlBar fullWidth={false}>
            <Page.ControlBarLeft>
              <Button
                onClick={this.handleEditTask}
                text="Edit Task"
                color={ComponentColor.Primary}
              />
            </Page.ControlBarLeft>
            <Page.ControlBarRight>
              <Button
                onClick={this.handleRunTask}
                text="Run Task"
                icon={IconFont.Play}
              />
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

  private get title() {
    const {currentTask} = this.props

    if (currentTask) {
      return `${currentTask.name} - Runs`
    }
    return 'Runs'
  }

  private handleRunTask = () => {
    const {onRunTask, match, getRuns} = this.props
    onRunTask(match.params.id)
    getRuns(match.params.id)
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
  getRuns: getRuns,
  onRunTask: runTask,
}

const connector = connect(mstp, mdtp)

export default connector(withRouter(TaskRunsPage))
