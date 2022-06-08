// Libraries
import React, {PureComponent} from 'react'
import {connect} from 'react-redux'

// Components
import VariableFormContext from 'src/variables/components/VariableFormContext'

// Types
import {AppState} from 'src/types'
import {getActiveQuery} from 'src/timeMachine/selectors'

interface OwnProps {
  onHideOverlay: () => void
}

interface StateProps {
  initialScript?: string
}

type Props = StateProps & OwnProps

class SaveAsVariable extends PureComponent<Props> {
  render() {
    const {initialScript, onHideOverlay} = this.props

    return (
      <VariableFormContext
        initialScript={initialScript}
        onHideOverlay={onHideOverlay}
        submitButtonText="Save as Variable"
      />
    )
  }
}

const mstp = (state: AppState) => {
  const activeQuery = getActiveQuery(state)

  return {
    initialScript: activeQuery.text,
  }
}

export default connect<StateProps, {}, OwnProps>(mstp, null)(SaveAsVariable)
