// Libraries
import React, {PureComponent} from 'react'

// Decorator
import {ErrorHandling} from 'src/shared/decorators/errors'
import {DOCS_URL_VERSION} from 'src/shared/constants/fluxFunctions'

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
    const docs = (
      <a
        href={`https://docs.influxdata.com/telegraf/${DOCS_URL_VERSION}/administration/troubleshooting/`}
        target="_blank"
        rel="noreferrer"
      >
        {' '}
        Telegraf Troubleshooting{' '}
      </a>
    )
    switch (this.props.loading) {
      case LoadingState.Loading:
        return `Timeout in ${this.props.countDownSeconds} seconds`
      case LoadingState.Done:
        return `${this.props.bucket} is receiving data loud and clear!`
      case LoadingState.NotFound:
      case LoadingState.Error:
        return docs
    }
  }
}

export default ConnectionInformation
