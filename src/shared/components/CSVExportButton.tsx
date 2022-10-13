// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {
  Button,
  ComponentStatus,
  ComponentColor,
  IconFont,
} from '@influxdata/clockface'

// Selectors and Actions
import {getActiveQuery} from 'src/timeMachine/selectors'
import {
  runDownloadQuery,
  DOWNLOAD_EVENT_COMPLETE,
} from 'src/timeMachine/actions/queries'

// Types
import {AppState, RemoteDataState} from 'src/types'

type Props = ConnectedProps<typeof connector>

interface State {
  state: RemoteDataState
}

class CSVExportButton extends PureComponent<Props, State> {
  private _controller: AbortController

  constructor(props) {
    super(props)
    this._controller = new AbortController()
    this._controller.signal.addEventListener(DOWNLOAD_EVENT_COMPLETE, () => {
      this.setState({state: RemoteDataState.Done})
    })
    this.state = {state: RemoteDataState.NotStarted}
  }

  public render() {
    if (this.state.state == RemoteDataState.Loading) {
      return (
        <Button
          text="Cancel"
          onClick={() => {
            this._controller.abort()
            this._controller.signal.dispatchEvent(
              new Event(DOWNLOAD_EVENT_COMPLETE)
            )
          }}
          color={ComponentColor.Danger}
        />
      )
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
    this.setState({state: RemoteDataState.Loading})
    this.props.download(this._controller)
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
