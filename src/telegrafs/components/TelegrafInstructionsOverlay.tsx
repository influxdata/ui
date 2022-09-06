// Libraries
import React, {FC, useContext} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'

// Components
import {Overlay} from '@influxdata/clockface'
import TelegrafInstructions from 'src/dataLoaders/components/verifyStep/TelegrafInstructions'
import GetResources from 'src/resources/components/GetResources'

// Types
import {Telegraf, AppState, ResourceType} from 'src/types'

// Selectors
import {getAll, getToken} from 'src/resources/selectors'
import {clearDataLoaders} from 'src/dataLoaders/actions/dataLoaders'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

interface OwnProps {
  onClose: () => void
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps &
  ReduxProps &
  RouteComponentProps<{orgID: string; id: string}>

const TelegrafInstructionsOverlay: FC<Props> = props => {
  const {token} = props
  const {params} = useContext(OverlayContext)

  const collector = () => {
    const {collectors} = props
    const collector = collectors.find(c => c.id === params.collectorId)
    return collector.id || ''
  }

  const handleDismiss = (): void => {
    const {onClearDataLoaders, onClose} = props
    onClearDataLoaders()
    onClose()
  }

  return (
    <Overlay.Container maxWidth={700}>
      <Overlay.Header
        title="Telegraf Setup Instructions"
        onDismiss={handleDismiss}
      />
      <Overlay.Body>
        <GetResources resources={[ResourceType.Authorizations]}>
          <TelegrafInstructions token={token} configID={collector()} />
        </GetResources>
      </Overlay.Body>
    </Overlay.Container>
  )
}

const mstp = (state: AppState) => {
  const {
    me: {name},
  } = state
  const token = getToken(state)
  const telegrafs = getAll<Telegraf>(state, ResourceType.Telegrafs)

  return {
    username: name,
    token,
    collectors: telegrafs,
  }
}

const mdtp = {
  onClearDataLoaders: clearDataLoaders,
}

const connector = connect(mstp, mdtp)

export default connector(withRouter(TelegrafInstructionsOverlay))
