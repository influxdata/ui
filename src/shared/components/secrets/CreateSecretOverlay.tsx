// Libraries
import React, {FC, useContext} from 'react'

// Components
import {Overlay} from '@influxdata/clockface'
import CreateSecretForm from 'src/shared/components/secrets/CreateSecretForm'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Types
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

const CreateSecretOverlay: FC = () => {
  const {onClose} = useContext(OverlayContext)

  return (
    <Overlay.Container maxWidth={750}>
      <Overlay.Header
        title="Add Secret"
        onDismiss={onClose}
        testID="create-secret-overlay-header"
      />
      <ErrorBoundary>
        <CreateSecretForm onDismiss={onClose} />
      </ErrorBoundary>
    </Overlay.Container>
  )
}

export default CreateSecretOverlay
