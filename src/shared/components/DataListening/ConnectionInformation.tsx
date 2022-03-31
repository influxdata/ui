// Libraries
import React, {PureComponent} from 'react'

// Decorator
import {ErrorHandling} from 'src/shared/decorators/errors'
import {Countdown} from 'src/shared/components/countdown/Countdown'

export enum LoadingState {
  NotStarted = 'NotStarted',
  Loading = 'Loading',
  Done = 'Done',
  NotFound = 'NotFound',
  Error = 'Error',
}

export interface Props {
  loading: LoadingState
  bucket: string
  countDownSeconds: number
}

@ErrorHandling
class ConnectionInformation extends PureComponent<Props> {
  public render() {
    return (
      <div data-testid="connection-information">
        <h4 className={`wizard-step--text-state ${this.className}`}>
          {this.header}
        </h4>
        <p>{this.additionalText}</p>
      </div>
    )
  }

  private get className(): string {
    switch (this.props.loading) {
      case LoadingState.Loading:
        return 'loading'
      case LoadingState.Done:
        return 'success'
      case LoadingState.NotFound:
      case LoadingState.Error:
        return 'error'
    }
  }

  private get header(): string {
    switch (this.props.loading) {
      case LoadingState.Loading:
        return 'Awaiting Connection...'
      case LoadingState.Done:
        return 'Connection Found!'
      case LoadingState.NotFound:
        return 'Data Not Found'
      case LoadingState.Error:
        return 'Error Listening for Data'
    }
  }

  private get additionalText(): any {
    const onErrorHelperText = this.props.children
    switch (this.props.loading) {
      case LoadingState.Loading:
        return (
          <>
            Timeout in{' '}
            <Countdown
              from={this.props.countDownSeconds}
              key={this.props.bucket}
            />{' '}
            seconds
          </>
        )
      case LoadingState.Done:
        return `${this.props.bucket} is receiving data loud and clear!`
      case LoadingState.NotFound:
      case LoadingState.Error:
        return onErrorHelperText
    }
  }
}

export default ConnectionInformation
