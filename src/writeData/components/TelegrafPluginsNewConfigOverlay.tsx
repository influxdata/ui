// Libraries
import React, {FC} from 'react'

// Components
import {Overlay} from '@influxdata/clockface'

interface TelegrafPluginsNewConfigOverlayProps {
  history: {
    goBack: () => void
  }
}
export const TelegrafPluginsNewConfigOverlay: FC<TelegrafPluginsNewConfigOverlayProps> = props => {
  const {history} = props
  const handleDismiss = () => {
    history.goBack()
  }

  return (
    <Overlay visible={true}>
      <Overlay.Container maxWidth={1200}>
        <Overlay.Header
          title="Create a Telegraf Configuration"
          onDismiss={handleDismiss}
        />
        <Overlay.Body className="data-loading--overlay">
          <div>Hello, this is the Overlay Body</div>
        </Overlay.Body>
      </Overlay.Container>
    </Overlay>
  )
}
