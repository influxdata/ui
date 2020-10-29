// Libraries
import React, {FC, useContext} from 'react'

// Components
import {Overlay} from '@influxdata/clockface'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

const AnnotationErrorOverlay: FC = () => {
  const {onClose} = useContext(OverlayContext)

  return (
    <Overlay.Container maxWidth={500}>
      <Overlay.Header title="Error" onDismiss={onClose} />
      <Overlay.Body>
        <p>Could not parse start and stop times from URL search parameters</p>
      </Overlay.Body>
    </Overlay.Container>
  )
}

export default AnnotationErrorOverlay
