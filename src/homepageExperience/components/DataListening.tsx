// Libraries
import React, {PureComponent} from 'react'
import {RouteComponentProps, withRouter} from 'react-router-dom'

// Components
import {ErrorHandling} from 'src/shared/decorators/errors'
import ConnectionInformation, {LoadingState} from './ConnectionInformation'
import {Button} from '@influxdata/clockface'

import {
  continuouslyCheckForData,
  TIMEOUT_MILLISECONDS,
  TIMER_WAIT,
} from 'src/shared/utils/dataListening'

interface OwnProps {
  bucket: string
}

interface State {
  loading: LoadingState
  timePassedInSeconds: number
  secondsLeft: number
  previousBucket: string
  retry: boolean
}

type Props = RouteComponentProps<{orgID: string}> & OwnProps

@ErrorHandling
class DataListening extends PureComponent<Props, State> {
  private intervalID: ReturnType<typeof setInterval>
  private timer: ReturnType<typeof setInterval>
  private TIMEOUT_SECONDS = TIMEOUT_MILLISECONDS / 1000

  constructor(props) {
    super(props)

    this.state = {
      loading: LoadingState.NotStarted,
      timePassedInSeconds: 0,
      secondsLeft: this.TIMEOUT_SECONDS,
      previousBucket: null,
      retry: false,
    }
  }

  public componentWillUnmount() {
    clearInterval(this.intervalID)
    clearInterval(this.timer)
    this.setState({
      timePassedInSeconds: 0,
      secondsLeft: this.TIMEOUT_SECONDS,
    })
  }

  componentDidUpdate() {
    const {bucket} = this.props
    if (
      (bucket !== '<BUCKET>' && this.state.previousBucket !== bucket) ||
      this.state.retry
    ) {
      // clear timer when bucket changes
      clearInterval(this.intervalID)
      clearInterval(this.timer)
      this.setState({
        timePassedInSeconds: 0,
        secondsLeft: this.TIMEOUT_SECONDS,
      })
      this.startListeningForData()
      this.setState({previousBucket: bucket, retry: false})
    }
  }

  private handleRetry = () => {
    this.setState({retry: true})
  }

  public render() {
    return (
      <div className="wizard-step--body-streaming" data-testid="streaming">
        {this.connectionInfo}
        {this.state.loading === LoadingState.NotFound && (
          <Button onClick={this.handleRetry} text="Retry" />
        )}
      </div>
    )
  }

  private get connectionInfo(): JSX.Element {
    const {loading} = this.state

    if (loading === LoadingState.NotStarted) {
      return
    }

    return (
      <ConnectionInformation
        loading={this.state.loading}
        bucket={this.props.bucket}
        countDownSeconds={this.state.secondsLeft}
      />
    )
  }

  private updateResponse = (checkDataStatus: LoadingState) => {
    this.setState({loading: checkDataStatus})
  }

  private startListeningForData = (): void => {
    const {
      bucket,
      match: {
        params: {orgID},
      },
    } = this.props

    this.setState({loading: LoadingState.Loading})
    this.startTimer()
    continuouslyCheckForData(orgID, bucket, this.updateResponse)
  }

  private startTimer() {
    this.setState({timePassedInSeconds: 0, secondsLeft: this.TIMEOUT_SECONDS})

    this.timer = setInterval(this.countDown, TIMER_WAIT)
  }

  private countDown = () => {
    const {secondsLeft} = this.state
    const secs = secondsLeft - 1
    this.setState({
      timePassedInSeconds: this.TIMEOUT_SECONDS - secs,
      secondsLeft: secs,
    })

    if (secs === 0) {
      clearInterval(this.timer)
    }
  }
}

export default withRouter(DataListening)
