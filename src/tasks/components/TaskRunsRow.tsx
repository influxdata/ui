// Libraries
import React, {PureComponent, ReactElement} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {Overlay, IndexList, FlexBox} from '@influxdata/clockface'
import RunLogsOverlay from 'src/tasks/components/RunLogsList'
import {FormattedDateTime} from 'src/utils/datetime/FormattedDateTime'

// Actions
import {getLogs, retryTask, getRuns} from 'src/tasks/actions/thunks'

// Types
import {ComponentSize, ComponentColor, Button} from '@influxdata/clockface'
import {AppState, Run} from 'src/types'
import {DEFAULT_TIME_FORMAT} from 'src/utils/datetime/constants'

interface OwnProps {
  taskID: string
  run: Run
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

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
          <FlexBox margin={ComponentSize.Medium}>
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
          </FlexBox>
        </IndexList.Cell>
      </IndexList.Row>
    )
  }

  private dateTimeString(dt: string): ReactElement {
    if (!dt) {
      return null
    }
    return (
      <FormattedDateTime format={DEFAULT_TIME_FORMAT} date={new Date(dt)} />
    )
  }

  private handleToggleOverlay = () => {
    const {taskID, run, getLogs} = this.props
    getLogs(taskID, run.id)

    this.setState({isImportOverlayVisible: !this.state.isImportOverlayVisible})
  }

  private handleRetry = async () => {
    const {retryTask, taskID, run, getRuns} = this.props

    await retryTask(taskID, run.id)
    await getRuns(taskID)
  }

  private get renderLogOverlay(): JSX.Element {
    const {isImportOverlayVisible} = this.state
    const {logs, run} = this.props

    return (
      <Overlay visible={isImportOverlayVisible}>
        <RunLogsOverlay
          onDismissOverlay={this.handleToggleOverlay}
          logs={logs}
          run={run}
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

const mdtp = {getLogs: getLogs, retryTask: retryTask, getRuns}

const connector = connect(mstp, mdtp)
export default connector(TaskRunsRow)
