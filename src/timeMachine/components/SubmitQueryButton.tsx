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
  cancelQueryByHashID,
  cancelAllRunningQueries,
  generateHashedQueryID,
} from 'src/timeMachine/actions/queries'
import {getAllVariables} from 'src/variables/selectors'
import {getOrg} from 'src/organizations/selectors'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

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

const DELAYTIME = 2000

class SubmitQueryButton extends PureComponent<Props> {
  public static defaultProps = {
    text: 'Submit',
    testID: 'time-machine-submit-button',
  }

  public state = {
    timer: false,
  }

  private timer

  public componentDidUpdate(prevProps) {
    if (
      isFlagEnabled('cancelQueryUiExpansion') &&
      this.props.queryStatus !== prevProps.queryStatus &&
      this.props.queryStatus === RemoteDataState.Loading
    ) {
      this.timer = setTimeout(() => {
        this.setState({timer: true})
        delete this.timer
      }, DELAYTIME)
    }
    if (
      this.props.queryStatus !== prevProps.queryStatus &&
      prevProps.queryStatus === RemoteDataState.Loading
    ) {
      if (this.timer) {
        clearTimeout(this.timer)
        delete this.timer
      }

      this.setState({timer: false})
    }
  }

  componentWillUnmount() {
    if (isFlagEnabled('cancelQueryUiExpansion')) {
      cancelAllRunningQueries()
    }
  }

  public render() {
    const {text, queryStatus, icon, testID, className} = this.props
    if (queryStatus === RemoteDataState.Loading && this.state.timer) {
      return (
        <Button
          text="Cancel"
          className={className}
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

  // TODO(ariel): delete when cancelQueryUiExpansion is successful
  private abortController: AbortController

  private handleClick = (): void => {
    event('SubmitQueryButton click')

    if (isFlagEnabled('cancelQueryUiExpansion')) {
      this.props.onSubmit()
    } else {
      // We need to instantiate a new AbortController per request
      // In order to allow for requests after cancellations:	    this.props.onSubmit()
      // https://stackoverflow.com/a/56548348/7963795

      this.timer = setTimeout(() => {
        this.setState({timer: true})
      }, DELAYTIME)
      this.abortController = new AbortController()
      this.props.onSubmit(this.abortController)
    }
  }

  private handleCancelClick = (): void => {
    if (this.props.onNotify) {
      this.props.onNotify(queryCancelRequest())
    }
    if (isFlagEnabled('cancelQueryUiExpansion')) {
      if (this.props.queryID) {
        cancelQueryByHashID(this.props.queryID)
      } else {
        cancelAllRunningQueries()
      }
    } else {
      if (this.abortController) {
        this.abortController.abort()
        this.abortController = null
      }
    }
  }
}

export {SubmitQueryButton}

const mstp = (state: AppState) => {
  const queryStatus = getActiveTimeMachine(state).queryResults.status

  const activeQueryText = getActiveQuery(state).text
  const submitButtonDisabled = activeQueryText === ''
  const allVars = getAllVariables(state)
  const orgID = getOrg(state).id

  const queryID = generateHashedQueryID(activeQueryText, allVars, orgID)

  return {queryID, submitButtonDisabled, queryStatus}
}

const mdtp = {
  onSubmit: saveAndExecuteQueries,
  onNotify: notify,
}

const connector = connect(mstp, mdtp)

export default connector(SubmitQueryButton)
