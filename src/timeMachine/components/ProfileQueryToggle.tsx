// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {SlideToggle, InputLabel, ComponentSize} from '@influxdata/clockface'

// Actions
import {setIsProfilingQuery} from 'src/timeMachine/actions'

// Utils
import {getActiveTimeMachine} from 'src/timeMachine/selectors'

// Types
import {AppState} from 'src/types'

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps

class TimeMachineQueries extends PureComponent<Props> {
  public render() {
    const {isProfilingQuery, isDisabledProfilingQuery} = this.props

    return (
      <div className="profile-query-toggle">
        <InputLabel>Profile Query</InputLabel>
        <SlideToggle
          active={isProfilingQuery}
          onChange={this.handleToggleIsProfilingQuery}
          size={ComponentSize.ExtraSmall}
          testID="profile-query--toggle"
          disabled={isDisabledProfilingQuery}
        />
      </div>
    )
  }

  private handleToggleIsProfilingQuery = () => {
    const {isProfilingQuery, onSetIsProfilingQuery} = this.props

    onSetIsProfilingQuery(!isProfilingQuery)
  }
}

const mstp = (state: AppState) => {
  const {isProfilingQuery, isDisabledProfilingQuery} = getActiveTimeMachine(
    state
  )

  return {isProfilingQuery, isDisabledProfilingQuery}
}

const mdtp = {
  onSetIsProfilingQuery: setIsProfilingQuery,
}

const connector = connect(mstp, mdtp)

export default connector(TimeMachineQueries)
