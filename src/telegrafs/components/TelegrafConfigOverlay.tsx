// Libraries
import React, {FC} from 'react'
import _ from 'lodash'

// Components
import {Overlay} from '@influxdata/clockface'
import GetResources from 'src/resources/components/GetResources'
import TelegrafConfigOverlayForm from 'src/telegrafs/components/TelegrafConfigOverlayForm'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Types
import {ResourceType} from 'src/types'

interface Props {
  onClose: () => void
}

const TelegrafConfigOverlay: FC<Props> = ({onClose}) => {
  const titleVerb = isFlagEnabled('editTelegrafs') ? 'Edit ' : ''

  return (
    <Overlay.Container maxWidth={1200} testID="telegraf-overlay">
      <Overlay.Header
        title={`${titleVerb}Telegraf Configuration`}
        onDismiss={onClose}
      />
      <GetResources resources={[ResourceType.Telegrafs]}>
        <TelegrafConfigOverlayForm onClose={onClose} />
      </GetResources>
    </Overlay.Container>
  )
}

export default TelegrafConfigOverlay
