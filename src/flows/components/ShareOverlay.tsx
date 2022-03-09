// Libraries
import React, {FC, useContext} from 'react'

// Components
import {Overlay} from '@influxdata/clockface'

import {OverlayContext} from 'src/overlays/components/OverlayController'

const ShareOverlay: FC = () => {
  const {onClose} = useContext(OverlayContext)
  return (
    <Overlay.Container maxWidth={600}>
      <Overlay.Header title="Share Notebook" onDismiss={onClose} />
      <Overlay.Body>hello</Overlay.Body>
      <Overlay.Footer>Done</Overlay.Footer>
    </Overlay.Container>
  )
}

export default ShareOverlay
