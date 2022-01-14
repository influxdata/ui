// Libraries
import React, {FC, useContext} from 'react'

// Components
import {Overlay} from '@influxdata/clockface'
import CreateSecretForm from 'src/shared/components/secrets/CreateSecretForm'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Types
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import GetResources from 'src/resources/components/GetResources'
import {ResourceType} from 'src/types'

const CreateSecretOverlay: FC = () => {
  const {onClose} = useContext(OverlayContext)

  return (
    <Overlay.Container maxWidth={750}>
      <Overlay.Header
        title="Add Secret"
        onDismiss={onClose}
        testID="create-secret-overlay-header"
      />
      <GetResources resources={[ResourceType.Secrets]}>
        <ErrorBoundary>
          <CreateSecretForm onDismiss={onClose} />
        </ErrorBoundary>
      </GetResources>
    </Overlay.Container>
  )
}

export default CreateSecretOverlay
