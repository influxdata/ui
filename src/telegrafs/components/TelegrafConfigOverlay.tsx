// Libraries
import React, {FC, useContext} from 'react'
import _ from 'lodash'

// Components
import {Overlay} from '@influxdata/clockface'
import GetResources from 'src/resources/components/GetResources'
import TelegrafConfigOverlayForm from 'src/telegrafs/components/TelegrafConfigOverlayForm'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Types
import {ResourceType} from 'src/types'

const TelegrafConfigOverlay: FC = () => {
  const {onClose} = useContext(OverlayContext)
  const titleVerb = isFlagEnabled('editTelegrafs') ? 'Edit ' : ''

  return (
    <Overlay.Container maxWidth={1200} testID="telegraf-overlay">
      <Overlay.Header
        title={`${titleVerb}Telegraf Configuration`}
        onDismiss={onClose}
      />
      <GetResources resources={[ResourceType.Telegrafs]}>
        <TelegrafConfigOverlayForm />
      </GetResources>
    </Overlay.Container>
  )
}

export default TelegrafConfigOverlay
