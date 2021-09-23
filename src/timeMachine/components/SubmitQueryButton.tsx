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
import {
  saveAndExecuteQueries,
  saveDraftQueries,
  setQueryResults,
} from 'src/timeMachine/actions/queries'
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
import {AppState, RemoteDataState, StatusRow} from 'src/types'
import {RunQuerySuccessResult} from 'src/shared/apis/query'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {GlobalQueryContextType} from 'src/shared/contexts/global'
import {
  getStatusesQuery,
  processStatusesResponse,
} from 'src/alerting/utils/statusEvents'

interface OwnProps {
  color?: ComponentColor
  text?: string
  icon?: IconFont
  testID?: string
  className?: string
  globalQueryContext?: GlobalQueryContextType
  isSubmitButtonDisabled?: boolean
  submitQueryStatus?: RemoteDataState
  onHandleSubmit?: any
  onHandleNotify?: any
  cancelQueries?: any
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

  private getQueryStatus(props) {
    return props.submitQueryStatus ?? props.queryStatus
  }

  private getIsSubmitButtonDisabled() {
    return this.props.isSubmitButtonDisabled ?? this.props.submitButtonDisabled
  }

  private getOnSubmit() {
    return (
      this.props.onHandleSubmit ??
      (isFlagEnabled('GlobalQueryContext')
        ? this.globalQueryContextSubmit
        : this.props.onSubmit)
    )
  }

  private getNotifier() {
    return this.props.onHandleNotify ?? this.props.onNotify
  }

  private getCanceller() {
    return this.props.cancelQueries ?? this.props.cancelAllRunningQueries
  }

  public componentDidUpdate(prevProps) {
    if (
      this.getQueryStatus(this.props) !== this.getQueryStatus(prevProps) &&
      this.getQueryStatus(this.props) === RemoteDataState.Loading
    ) {
      this.timer = setTimeout(() => {
        this.setState({timer: true})
        delete this.timer
      }, DELAYTIME)
    }
    if (
      this.getQueryStatus(this.props) !== this.getQueryStatus(prevProps) &&
      this.getQueryStatus(prevProps) === RemoteDataState.Loading
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

    const canceller = this.getCanceller()
    canceller()
  }

  public render() {
    const {color, text, icon, testID, className} = this.props
    if (
      this.getQueryStatus(this.props) === RemoteDataState.Loading &&
      this.state.timer
    ) {
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
      />
    )
  }

  private get buttonStatus(): ComponentStatus {
    if (this.getIsSubmitButtonDisabled()) {
      return ComponentStatus.Disabled
    }

    if (this.getQueryStatus(this.props) === RemoteDataState.Loading) {
      return ComponentStatus.Loading
    }

    return ComponentStatus.Default
  }

  private handleClick = (): void => {
    event('SubmitQueryButton click')

    // if (isFlagEnabled('GlobalQueryContext')) {
    //   console.log('hshs')
    //   this.globalQueryContextSubmit()
    //   return
    // }

    const onSubmit = this.getOnSubmit()
    onSubmit()
  }

  private globalQueryContextSubmit = async (): Promise<void> => {
    await this.props.saveDraftQueries()

    const startTime = window.performance.now()
    this.props.setQueryResults(RemoteDataState.Loading, [], null)

    const queries = this.props.queries.filter(({text}) => {
      return !!text.trim()
    })

    if (!queries.length) {
      this.props.setQueryResults(RemoteDataState.Done, [], 0, null, [])

      return
    }

    const override = {
      orgID: this.props.orgID,
      vars: this.props.allVars.reduce((acc, cur) => {
        acc[cur.id] = cur
        return acc
      }, {}),
    }

    const promises = queries.map(({text}) => {
      return this.props.globalQueryContext?.runGlobalBasic(text, override)
        .promise
    })
    const statusesPromise = processStatusesResponse(
      this.props.globalQueryContext?.runGlobalBasic(
        getStatusesQuery(this.props.checkID),
        override
      )
    ).promise

    Promise.all(promises).then(async results => {
      const statuses = (await statusesPromise) as StatusRow[][]
      const files = (results as RunQuerySuccessResult[]).map(r => r.csv)
      const duration = window.performance.now() - startTime

      this.props.setQueryResults(
        RemoteDataState.Done,
        files,
        duration,
        null,
        statuses
      )
    })

    return
  }

  private handleCancelClick = (): void => {
    const notifier = this.getNotifier()
    if (notifier) {
      notifier(queryCancelRequest())
    }

    const canceller = this.getCanceller()
    canceller()
  }
}

export {SubmitQueryButton}

const mstp = (state: AppState) => {
  const queryStatus = getActiveTimeMachine(state).queryResults.status
  const queries = getActiveTimeMachine(state).view.properties.queries

  const activeQueryText = getActiveQuery(state).text
  const submitButtonDisabled = activeQueryText === ''
  const allVars = getAllVariables(state)
  const orgID = getOrg(state).id
  const checkID = state.alertBuilder.id

  const queryID = generateHashedQueryID(activeQueryText, allVars, orgID)

  return {
    queryID,
    submitButtonDisabled,
    queryStatus,
    orgID,
    queries,
    allVars,
    activeQueryText,
    checkID,
  }
}

const mdtp = {
  saveDraftQueries,
  setQueryResults,
  onSubmit: saveAndExecuteQueries,
  onNotify: notify,
  cancelAllRunningQueries: cancelAllRunningQueries,
}

const connector = connect(mstp, mdtp)

export default connector(SubmitQueryButton)
