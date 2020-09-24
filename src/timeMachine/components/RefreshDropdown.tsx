// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {isEqual} from 'lodash'

// Components
import AutoRefreshDropdown from 'src/shared/components/dropdown_auto_refresh/AutoRefreshDropdown'

// Utils
import {AutoRefresher} from 'src/utils/AutoRefresher'
import {event} from 'src/cloud/utils/reporting'
import {delayEnableCancelBtn} from 'src/shared/actions/app'

// Actions
import {executeQueries} from 'src/timeMachine/actions/queries'
import {setAutoRefresh} from 'src/timeMachine/actions'
import {getActiveTimeMachine} from 'src/timeMachine/selectors'

// Types
import {AppState, AutoRefreshStatus, RemoteDataState} from 'src/types'

interface OwnProps {
  abortController: AbortController
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

class TimeMachineRefreshDropdown extends PureComponent<Props> {
  private autoRefresher = new AutoRefresher()

  public componentDidMount() {
    const {autoRefresh} = this.props
    if (autoRefresh.status === AutoRefreshStatus.Active) {
      this.autoRefresher.poll(autoRefresh.interval)
    }

    this.autoRefresher.subscribe(this.executeQueries)
  }

  private timer

  public componentDidUpdate(prevProps) {
    const {autoRefresh, queryStatus} = this.props
    if (
      queryStatus !== prevProps.queryStatus &&
      prevProps.queryStatus === RemoteDataState.Loading &&
      this.timer
    ) {
      clearTimeout(this.timer)
      delete this.timer
    }

    if (!isEqual(autoRefresh, prevProps.autoRefresh)) {
      if (autoRefresh.status === AutoRefreshStatus.Active) {
        this.autoRefresher.poll(autoRefresh.interval)
        return
      }

      this.autoRefresher.stopPolling()
    }

    // if (
    //   this.props.queryStatus !== prevProps.queryStatus &&
    //   prevProps.queryStatus === RemoteDataState.Loading
    // ) {
    //   if (this.timer) {
    //     clearTimeout(this.timer)
    //     delete this.timer
    //   }

    //   this.setState({timer: false})
    // }
  }

  public componentWillUnmount() {
    this.autoRefresher.unsubscribe(this.executeQueries)
    this.autoRefresher.stopPolling()
  }

  public render() {
    const {autoRefresh} = this.props

    return (
      <AutoRefreshDropdown
        selected={autoRefresh}
        onChoose={this.handleChooseAutoRefresh}
        onManualRefresh={this.executeQueries}
      />
    )
  }

  private handleChooseAutoRefresh = (interval: number) => {
    const {onSetAutoRefresh, autoRefresh} = this.props

    if (interval === 0) {
      onSetAutoRefresh({
        ...autoRefresh,
        status: AutoRefreshStatus.Paused,
        interval,
      })
      return
    }

    onSetAutoRefresh({
      ...autoRefresh,
      interval,
      status: AutoRefreshStatus.Active,
    })
  }
  private abortController: AbortController
  private executeQueries = () => {
    event('RefreshQueryButton click')
    // We need to instantiate a new AbortController per request
    // In order to allow for requests after cancellations:
    // https://stackoverflow.com/a/56548348/7963795

    this.timer = this.props.onSetCancelBtnTimer()
    this.abortController = this.props.abortController
    // maybe going to have to assign this to the reducer?
    // This isn't going to work because of the same reason as the issue introduced above
    this.props.onExecuteQueries(this.abortController)
  }
}

const mstp = (state: AppState) => {
  const {shouldShowCancelBtn} = state.app.ephemeral
  const queryStatus = getActiveTimeMachine(state).queryResults.status
  const {autoRefresh} = getActiveTimeMachine(state)

  return {autoRefresh, queryStatus, shouldShowCancelBtn}
}

const mdtp = {
  onExecuteQueries: executeQueries,
  onSetCancelBtnTimer: delayEnableCancelBtn,
  onSetAutoRefresh: setAutoRefresh,
}

const connector = connect(mstp, mdtp)

export default connector(TimeMachineRefreshDropdown)
