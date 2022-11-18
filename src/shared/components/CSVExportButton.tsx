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

// Worker
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import downloadWorker from 'worker-plugin/loader!../workers/downloadHelper'

type Props = ConnectedProps<typeof connector>

interface State {
  isEnabled: boolean
}

class CSVExportButton extends PureComponent<Props, State> {
  constructor(props) {
    super(props)
    this.state = {isEnabled: false}

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(downloadWorker).then(
        () => this.setState({isEnabled: true}),
        function (err) {
          console.error('ServiceWorker registration failed: ', err)
        }
      )
    }
  }

  public render() {
    if (!this.state.isEnabled) {
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

  return {disabled}
}

const mdtp = {
  download: runDownloadQuery,
}

const connector = connect(mstp, mdtp)

export default connector(CSVExportButton)
