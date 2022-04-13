import React, {FC, useContext} from 'react'

// Components
import {Overlay} from '@influxdata/clockface'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Types
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

interface OwnProps {
  onClose: () => void
}

const PayGSupportOverlay: FC<OwnProps> = () => {
  const {onClose} = useContext(OverlayContext)

  return (
    <Overlay.Container maxWidth={500}>
      <Overlay.Header
        testID="payg-support-overlay-header"
        title="Contact Support"
        onDismiss={onClose}
      />

      <ErrorBoundary>
        <Overlay.Body></Overlay.Body>
      </ErrorBoundary>
    </Overlay.Container>
  )
}

export default PayGSupportOverlay
