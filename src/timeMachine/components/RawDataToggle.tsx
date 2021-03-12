// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {SlideToggle, InputLabel, ComponentSize} from '@influxdata/clockface'

// Actions
import {setIsViewingRawData} from 'src/timeMachine/actions'

// Utils
import {getActiveTimeMachine} from 'src/timeMachine/selectors'

// Types
import {AppState} from 'src/types'

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps

class TimeMachineQueries extends PureComponent<Props> {
  public render() {
    const {isViewingRawData, isDisabledViewRawData} = this.props

    return (
      <div className="view-raw-data-toggle">
        <InputLabel>View Raw Data</InputLabel>
        <SlideToggle
          active={isViewingRawData}
          onChange={this.handleToggleIsViewingRawData}
          size={ComponentSize.ExtraSmall}
          testID="raw-data--toggle"
          disabled={isDisabledViewRawData}
        />
      </div>
    )
  }

  private handleToggleIsViewingRawData = () => {
    const {isViewingRawData, onSetIsViewingRawData} = this.props

    onSetIsViewingRawData(!isViewingRawData)
  }
}

const mstp = (state: AppState) => {
  const {isViewingRawData, isDisabledViewRawData} = getActiveTimeMachine(state)

  return {isViewingRawData, isDisabledViewRawData}
}

const mdtp = {
  onSetIsViewingRawData: setIsViewingRawData,
}

const connector = connect(mstp, mdtp)

export default connector(TimeMachineQueries)
