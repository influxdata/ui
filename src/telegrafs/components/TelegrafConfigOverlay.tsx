// Libraries
import React, {FC} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import _ from 'lodash'

// Components
import {Overlay} from '@influxdata/clockface'
import GetResources from 'src/resources/components/GetResources'
import TelegrafConfigOverlayForm from 'src/telegrafs/components/TelegrafConfigOverlayForm'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Actions
import {updateTelegraf} from 'src/telegrafs/actions/thunks'

// Types
import {ResourceType, Telegraf} from 'src/types'

interface OwnProps {
  onClose: () => void
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

const TelegrafConfigOverlay: FC<Props> = ({onUpdateTelegraf, onClose}) => {
  const handleUpdateTelegraf = (telegraf: Telegraf): void => {
    onUpdateTelegraf(telegraf)
    onClose()
  }

  const titleVerb = isFlagEnabled('editTelegrafs') ? 'Edit ' : ''

  return (
    <Overlay.Container maxWidth={1200}>
      <Overlay.Header
        title={`${titleVerb}Telegraf Configuration`}
        onDismiss={onClose}
      />
      <GetResources resources={[ResourceType.Telegrafs]}>
        <TelegrafConfigOverlayForm
          onClose={onClose}
          onUpdateTelegraf={handleUpdateTelegraf}
        />
      </GetResources>
    </Overlay.Container>
  )
}

const mdtp = {
  onUpdateTelegraf: updateTelegraf,
}

const connector = connect(null, mdtp)

export default connector(TelegrafConfigOverlay)
