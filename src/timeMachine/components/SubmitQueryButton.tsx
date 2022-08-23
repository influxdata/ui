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
  cancelAllRunningQueries,
  generateHashedQueryID,
} from 'src/timeMachine/actions/queries'
import {getAllVariables} from 'src/variables/selectors'
import {getOrg} from 'src/organizations/selectors'

// Types
import {AppState, RemoteDataState} from 'src/types'

interface OwnProps {
  color?: ComponentColor
  text?: string
  icon?: IconFont
  testID?: string
  className?: string
  disabledTitleText?: string // Text to be displayed on hover tooltip when the button is disabled
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
    // Clearing and removing timer before the component is unmounted
    clearTimeout(this.timer)
    delete this.timer

    this.props.cancelAllRunningQueries()
  }

  public render() {
    const {
      color,
      text,
      queryStatus,
      icon,
      testID,
      className,
      disabledTitleText,
    } = this.props
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
          style={{minWidth: '100px'}}
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
        color={color ?? ComponentColor.Primary}
        testID={testID}
        style={{minWidth: '100px'}}
        disabledTitleText={disabledTitleText}
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

    this.props.onSubmit()
  }

  private handleCancelClick = (): void => {
    if (this.props.onNotify) {
      this.props.onNotify(queryCancelRequest())
    }
    this.props.cancelAllRunningQueries()
  }
}

export {SubmitQueryButton}

const mstp = (state: AppState) => {
  const queryStatus = getActiveTimeMachine(state).queryResults.status

  const activeQueryText = getActiveQuery(state).text
  const tags = getActiveQuery(state).builderConfig?.tags ?? []
  const activeQuery = getActiveQuery(state)
  const measurementTag = tags?.[0]
  const submitButtonDisabled =
    activeQueryText === '' ||
    (activeQuery.editMode === 'builder' &&
      measurementTag &&
      measurementTag.values.length === 0)
  const allVars = getAllVariables(state)
  const orgID = getOrg(state).id

  const queryID = generateHashedQueryID(activeQueryText, allVars, orgID)

  return {queryID, submitButtonDisabled, queryStatus}
}

const mdtp = {
  onSubmit: saveAndExecuteQueries,
  onNotify: notify,
  cancelAllRunningQueries: cancelAllRunningQueries,
}

const connector = connect(mstp, mdtp)

export default connector(SubmitQueryButton)
