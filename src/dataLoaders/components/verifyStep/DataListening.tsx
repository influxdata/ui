// Libraries
import React, {PureComponent} from 'react'
import {withRouter, RouteComponentProps} from 'react-router-dom'

// Components
import {ErrorHandling} from 'src/shared/decorators/errors'
import {
  Button,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
} from '@influxdata/clockface'
import ConnectionInformation, {
  LoadingState,
} from 'src/shared/components/DataListening/ConnectionInformation'
import {
  continuouslyCheckForData,
  TIMEOUT_MILLISECONDS,
} from 'src/shared/utils/dataListening'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

interface OwnProps {
  bucket: string
}

interface State {
  loading: LoadingState
  timePassedInSeconds: number
  secondsLeft: number
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

  public render() {
    return (
      <div className="wizard-step--body-streaming" data-testid="streaming">
        {this.connectionInfo}
        {this.listenButton}
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
        <SafeBlankLink href="https://docs.influxdata.com/telegraf/latest/configure_plugins/troubleshoot/">
          Telegraf Troubleshooting
        </SafeBlankLink>
      </ConnectionInformation>
    )
  }

  private get listenButton(): JSX.Element {
    const {loading} = this.state

    if (loading === LoadingState.Loading || loading === LoadingState.Done) {
      return
    }

    return (
      <Button
        color={ComponentColor.Primary}
        text="Listen for Data"
        size={ComponentSize.Medium}
        onClick={this.handleClick}
        status={ComponentStatus.Default}
        titleText="Listen for Data"
      />
    )
  }

  private updateResponse = (checkDataStatus: LoadingState) => {
    this.setState({loading: checkDataStatus})
  }

  private handleClick = (): void => {
    const {
      bucket,
      match: {
        params: {orgID},
      },
    } = this.props

    this.setState({loading: LoadingState.Loading})
    continuouslyCheckForData(orgID, bucket, this.updateResponse)
  }
}

export default withRouter(DataListening)
