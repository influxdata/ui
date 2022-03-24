// Libraries
import React, {FC} from 'react'
import {connect} from 'react-redux'

// Components
import {Button} from '@influxdata/clockface'

// Actions
import {loadCustomCheckQueryState} from 'src/timeMachine/actions'
import {event} from 'src/cloud/utils/reporting'

interface DispatchProps {
  onLoadCustomCheckQueryState: typeof loadCustomCheckQueryState
}

const CustomizeCheckQueryButton: FC<DispatchProps> = ({
  onLoadCustomCheckQueryState,
}) => {
  React.useEffect(() => {
    event('CustomizeCheckQueryButton')
  }, [])
  const switchToEditor = () => {
    onLoadCustomCheckQueryState()
  }
  return (
    <Button
      text="Customize Check Query"
      titleText="Switch to Script Editor"
      onClick={switchToEditor}
      testID="switch-to-custom-check"
    />
  )
}

const mdtp = {
  onLoadCustomCheckQueryState: loadCustomCheckQueryState,
}

export default connect<{}, DispatchProps>(null, mdtp)(CustomizeCheckQueryButton)
