// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {Button, ComponentStatus, IconFont} from '@influxdata/clockface'

// Selectors and Actions
import {getActiveQuery} from 'src/timeMachine/selectors'
import {runDownloadQuery} from 'src/timeMachine/actions/queries'

// Types
import {AppState} from 'src/types'

type Props = ConnectedProps<typeof connector>

interface State {
  browserSupportsDownload: boolean
}

class CSVExportButton extends PureComponent<Props, State> {
  constructor(props) {
    super(props)
    this.state = {browserSupportsDownload: false}

    if (props.workerRegistration) {
      ;(props.workerRegistration as Promise<ServiceWorkerRegistration>).then(
        registrationResult => {
          if (registrationResult.active.state == 'activated') {
            this.setState({browserSupportsDownload: true})
          } else {
            console.error(
              'Feature not available, because ServiceWorker is registered but inactive.'
            )
          }
        },
        function (err) {
          console.error(
            'Feature not available, because ServiceWorker registration failed: ',
            err
          )
        }
      )
    }
  }

  public render() {
    if (!this.state.browserSupportsDownload) {
      return null
    }

    return (
      <Button
        titleText={this.titleText}
        text="CSV"
        icon={IconFont.Download_New}
        onClick={this.handleClick}
        status={
          this.props.disabled
            ? ComponentStatus.Disabled
            : ComponentStatus.Default
        }
        testID="time-machine--download-csv"
      />
    )
  }

  private get titleText(): string {
    const {disabled} = this.props

    if (!disabled) {
      return 'Download query results as a .CSV file'
    }

    return 'Create a query in order to download results as .CSV'
  }

  private handleClick = () => {
    this.props.download()
  }
}

const mstp = (state: AppState) => {
  const activeQueryText = getActiveQuery(state).text
  const disabled = activeQueryText === ''

  return {disabled, workerRegistration: state.app.persisted.workerRegistration}
}

const mdtp = {
  download: runDownloadQuery,
}

const connector = connect(mstp, mdtp)

export default connector(CSVExportButton)
