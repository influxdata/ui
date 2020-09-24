// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {
  Button,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  IconFont,
} from '@influxdata/clockface'

// Actions
import {saveAndExecuteQueries} from 'src/timeMachine/actions/queries'
import {notify} from 'src/shared/actions/notifications'

// Utils
import {getActiveTimeMachine, getActiveQuery} from 'src/timeMachine/selectors'
import {event} from 'src/cloud/utils/reporting'
import {queryCancelRequest} from 'src/shared/copy/notifications'
import {
  clearCancelBtnTimeout,
  delayEnableCancelBtn,
  resetCancelBtnState,
} from 'src/shared/actions/app'
import {cancelPendingResults} from 'src/timeMachine/actions/queries'
import {shouldShowCancelBtnSelector} from 'src/shared/selectors/app'

// Types
import {AppState, RemoteDataState} from 'src/types'

interface OwnProps {
  text?: string
  icon?: IconFont
  testID?: string
  className?: string
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

class SubmitQueryButton extends PureComponent<Props> {
  public static defaultProps = {
    text: 'Submit',
    testID: 'time-machine-submit-button',
  }

  public componentDidMount() {
    if (this.props.shouldShowCancelBtn) {
      this.props.onResetCancelBtnState()
    }
    clearCancelBtnTimeout()
  }

  public componentWillUnmount() {
    if (this.props.shouldShowCancelBtn) {
      this.props.onResetCancelBtnState()
    }
    clearCancelBtnTimeout()
  }

  public componentDidUpdate(prevProps) {
    if (
      this.props.queryStatus !== prevProps.queryStatus &&
      prevProps.queryStatus === RemoteDataState.Loading &&
      this.props.shouldShowCancelBtn
    ) {
      this.props.onResetCancelBtnState()
      clearCancelBtnTimeout()
    }
  }

  public render() {
    const {
      className,
      icon,
      queryStatus,
      testID,
      text,
      shouldShowCancelBtn,
    } = this.props

    if (queryStatus === RemoteDataState.Loading && shouldShowCancelBtn) {
      return (
        <Button
          text="Cancel"
          className={className}
          icon={icon}
          size={ComponentSize.Small}
          status={ComponentStatus.Default}
          onClick={this.handleCancelClick}
          color={ComponentColor.Danger}
          testID={testID}
          style={{width: '100px'}}
        />
      )
    }
    return (
      <Button
        text={text}
        className={className}
        icon={icon}
        size={ComponentSize.Small}
        status={this.buttonStatus}
        onClick={this.handleClick}
        color={ComponentColor.Primary}
        testID={testID}
        style={{width: '100px'}}
      />
    )
  }

  private get buttonStatus(): ComponentStatus {
    const {queryStatus, submitButtonDisabled} = this.props

    if (submitButtonDisabled) {
      return ComponentStatus.Disabled
    }

    if (queryStatus === RemoteDataState.Loading) {
      return ComponentStatus.Loading
    }

    return ComponentStatus.Default
  }

  private handleClick = (): void => {
    event('SubmitQueryButton click')
    this.props.onSetCancelBtnTimer()
    this.props.onSubmit()
  }

  private handleCancelClick = (): void => {
    if (this.props.onNotify) {
      this.props.onNotify(queryCancelRequest())
    }
    this.props.onResetCancelBtnState()
    clearCancelBtnTimeout()
    cancelPendingResults()
  }
}

export {SubmitQueryButton}

const mstp = (state: AppState) => {
  const shouldShowCancelBtn = shouldShowCancelBtnSelector(state)
  const submitButtonDisabled = getActiveQuery(state).text === ''
  const queryStatus = getActiveTimeMachine(state).queryResults.status

  return {shouldShowCancelBtn, submitButtonDisabled, queryStatus}
}

const mdtp = {
  onResetCancelBtnState: resetCancelBtnState,
  onSetCancelBtnTimer: delayEnableCancelBtn,
  onSubmit: saveAndExecuteQueries,
  onNotify: notify,
}

const connector = connect(mstp, mdtp)

export default connector(SubmitQueryButton)
