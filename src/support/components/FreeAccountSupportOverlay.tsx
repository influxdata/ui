import React, {FC, useContext} from 'react'

// Components
import {Overlay} from '@influxdata/clockface'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Components
import CloudUpgradeButton from 'src/shared/components/CloudUpgradeButton'

interface OwnProps {
  onClose: () => void
}

const FreeAccountSupportOverlay: FC<OwnProps> = () => {
  const {onClose} = useContext(OverlayContext)

  return (
    <Overlay.Container maxWidth={550}>
      <Overlay.Header
        testID="free-support-overlay-header"
        title="Contact Support"
        onDismiss={onClose}
      />

      <Overlay.Body></Overlay.Body>
      <Overlay.Footer>
        <CloudUpgradeButton />
      </Overlay.Footer>
    </Overlay.Container>
  )
}

export default FreeAccountSupportOverlay
