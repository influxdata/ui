// Libraries
import React, {FC} from 'react'
import {useHistory} from 'react-router-dom'

// Components
import {Overlay} from '@influxdata/clockface'
import EditSecretForm from 'src/secrets/components/EditSecretForm'

// Types
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import GetResources from 'src/resources/components/GetResources'
import {ResourceType} from 'src/types'

const EditSecretOverlay: FC = () => {
  const history = useHistory()

  return (
    <Overlay visible={true}>
      <Overlay.Container maxWidth={750}>
        <Overlay.Header
          title="Edit Secret"
          onDismiss={() => history.goBack()}
          testID="modify-secret-overlay-header"
        />
        <Overlay.Body>
          <GetResources resources={[ResourceType.Secrets]}>
            <ErrorBoundary>
              <EditSecretForm />
            </ErrorBoundary>
          </GetResources>
        </Overlay.Body>
      </Overlay.Container>
    </Overlay>
  )
}

export default EditSecretOverlay
