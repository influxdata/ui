// Libraries
import React, {FC, useContext, useEffect} from 'react'

// Components
import {Overlay} from '@influxdata/clockface'
import GetResources from 'src/resources/components/GetResources'
import TelegrafConfigOverlayForm from 'src/telegrafs/components/TelegrafConfigOverlayForm'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Types
import {ResourceType} from 'src/types'
import {event} from 'src/cloud/utils/reporting'

const TelegrafConfigOverlay: FC = () => {
  const {onClose} = useContext(OverlayContext)

  useEffect(() => {
    event(`telegraf_page.edit_config`)
  }, [])

  return (
    <Overlay.Container maxWidth={1200} testID="telegraf-overlay">
      <Overlay.Header title="Edit Telegraf Configuration" onDismiss={onClose} />
      <GetResources resources={[ResourceType.Telegrafs]}>
        <TelegrafConfigOverlayForm />
      </GetResources>
    </Overlay.Container>
  )
}

export default TelegrafConfigOverlay
