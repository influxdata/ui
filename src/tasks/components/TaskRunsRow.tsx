// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {RouteComponentProps} from 'react-router-dom'
import moment from 'moment'

// Components
import {Overlay, IndexList} from '@influxdata/clockface'
import RunLogsOverlay from 'src/tasks/components/RunLogsList'

// Actions
import {getLogs, retryTask} from 'src/tasks/actions/thunks'

// Types
import {ComponentSize, ComponentColor, Button} from '@influxdata/clockface'
import {AppState, Run} from 'src/types'
import {DEFAULT_TIME_FORMAT} from 'src/shared/constants'

interface OwnProps {
  taskID: string
  orgID: string
  run: Run
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps & RouteComponentProps

interface State {
  isImportOverlayVisible: boolean
}

class TaskRunsRow extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      isImportOverlayVisible: false,
    }
  }

  public render() {
    const {run} = this.props
    return (
      <IndexList.Row>
        <IndexList.Cell>{run.status}</IndexList.Cell>
        <IndexList.Cell>{this.dateTimeString(run.scheduledFor)}</IndexList.Cell>
        <IndexList.Cell>{this.dateTimeString(run.startedAt)}</IndexList.Cell>
        <IndexList.Cell>{run.duration}</IndexList.Cell>
        <IndexList.Cell>
          <Button
            key={`logs-${run.id}`}
            size={ComponentSize.ExtraSmall}
            color={ComponentColor.Default}
            text="View Logs"
            onClick={this.handleToggleOverlay}
          />
          {run.status === 'failed' && (
            <Button
              key={`retry-${run.id}`}
              size={ComponentSize.ExtraSmall}
              color={ComponentColor.Default}
              text="Retry"
              onClick={this.handleRetry}
            />
          )}
          {this.renderLogOverlay}
        </IndexList.Cell>
      </IndexList.Row>
    )
  }

  private dateTimeString(dt: string): string {
    if (!dt) {
      return ''
    }
    const newdate = new Date(dt)
    const {timeZone} = this.props
    const formatted =
      timeZone === 'UTC'
        ? moment(newdate)
            .utc()
            .format(DEFAULT_TIME_FORMAT)
        : moment(newdate).format(DEFAULT_TIME_FORMAT)

    return formatted
  }

  private handleToggleOverlay = () => {
    const {taskID, run, getLogs} = this.props
    getLogs(taskID, run.id)

    this.setState({isImportOverlayVisible: !this.state.isImportOverlayVisible})
  }

  private handleRetry = async () => {
    const {retryTask, taskID, run, orgID, history} = this.props
    await retryTask(taskID, run.id)
    history.push(`/orgs/${orgID}/tasks/${taskID}/edit`)
  }

  private get renderLogOverlay(): JSX.Element {
    const {isImportOverlayVisible} = this.state
    const {logs} = this.props

    return (
      <Overlay visible={isImportOverlayVisible}>
        <RunLogsOverlay
          onDismissOverlay={this.handleToggleOverlay}
          logs={logs}
        />
      </Overlay>
    )
  }
}

const mstp = (state: AppState) => {
  const {logs} = state.resources.tasks
  const timeZone = state.app.persisted.timeZone

  return {logs, timeZone}
}

const mdtp = {getLogs: getLogs, retryTask: retryTask}

const connector = connect(mstp, mdtp)
export default connector(TaskRunsRow)
