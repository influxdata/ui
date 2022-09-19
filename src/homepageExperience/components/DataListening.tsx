// Libraries
import React, {PureComponent} from 'react'
import {RouteComponentProps, withRouter} from 'react-router-dom'

// Components
import {ErrorHandling} from 'src/shared/decorators/errors'
import ConnectionInformation, {
  LoadingState,
} from 'src/shared/components/DataListening/ConnectionInformation'
import {Button, FlexBox, JustifyContent} from '@influxdata/clockface'

import {
  continuouslyCheckForData,
  TIMEOUT_MILLISECONDS,
} from 'src/shared/utils/dataListening'
import {DEFAULT_BUCKET} from '../../writeData/components/WriteDataDetailsContext'

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

  componentDidMount() {
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
    if (
      this.props.bucket === 'sample-bucket' ||
      this.props.bucket === DEFAULT_BUCKET
    ) {
      return (
        <FlexBox justifyContent={JustifyContent.Center}>
          <h4>Please select a bucket to listen to</h4>
        </FlexBox>
      )
    }
    return (
      <div className="wizard-step--body-streaming" data-testid="streaming">
        {this.connectionInfo}
        {(this.state.loading === LoadingState.NotFound ||
          this.state.loading === LoadingState.Error) && (
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
      >
        <span> Make sure the correct bucket is selected and then retry. </span>
      </ConnectionInformation>
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
    this.intervalID = continuouslyCheckForData(
      orgID,
      bucket,
      this.updateResponse
    )
  }
}

export default withRouter(DataListening)
