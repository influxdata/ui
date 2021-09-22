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
import {AppState, RemoteDataState} from 'src/types'
import {RunQuerySuccessResult} from 'src/shared/apis/query'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {GlobalQueryContextType} from 'src/shared/contexts/global'

interface OwnProps {
  color?: ComponentColor
  text?: string
  icon?: IconFont
  testID?: string
  className?: string
  globalQueryContext?: GlobalQueryContextType
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
    const {color, text, queryStatus, icon, testID, className} = this.props
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

    if (isFlagEnabled('GlobalQueryContext')) {
      this.globalQueryContextSubmit()
      return
    }

    this.props.onSubmit()
  }

  private globalQueryContextSubmit = async (): Promise<void> => {
    await this.props.saveDraftQueries()
    this.props.setQueryResults(RemoteDataState.Loading, [], null)

    const queries = this.props.queries.filter(({text}) => {
      return !!text.trim()
    })

    if (!queries.length) {
      this.props.setQueryResults(RemoteDataState.Done, [], 0, null, [])

      return
    }

    const promises = queries.map(({text}) => {
      return this.props.globalQueryContext?.runGlobalBasic(text, {
        orgID: this.props.orgID,
        vars: this.props.allVars.reduce((acc, cur) => {
          acc[cur.id] = cur
          return acc
        }, {}),
      }).promise
    })

    Promise.all(promises).then(results => {
      const files = (results as RunQuerySuccessResult[]).map(r => r.csv)
      this.props.setQueryResults(RemoteDataState.Done, files, 0, null, [])
    })

    return
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
  const queries = getActiveTimeMachine(state).view.properties.queries

  const activeQueryText = getActiveQuery(state).text
  const submitButtonDisabled = activeQueryText === ''
  const allVars = getAllVariables(state)
  const orgID = getOrg(state).id

  const queryID = generateHashedQueryID(activeQueryText, allVars, orgID)

  return {
    queryID,
    submitButtonDisabled,
    queryStatus,
    orgID,
    queries,
    allVars,
    activeQueryText,
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
