// Libraries
import React, {FC} from 'react'
import {useHistory} from 'react-router-dom'

// Components
import {Overlay} from '@influxdata/clockface'
import CreateSecretForm from 'src/shared/components/secrets/CreateSecretForm'

// Types
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import GetResources from 'src/resources/components/GetResources'
import {ResourceType} from 'src/types'

const CreateSecretOverlay: FC = () => {
  const history = useHistory()

  const onDismiss = () => {
    history.goBack()
  }

  return (
    <Overlay visible={true}>
      <Overlay.Container maxWidth={750}>
        <Overlay.Header
          title="Add Secret"
          onDismiss={onDismiss}
          testID="modify-secret-overlay-header"
        />
        <GetResources resources={[ResourceType.Secrets]}>
          <ErrorBoundary>
            <CreateSecretForm onDismiss={onDismiss} />
          </ErrorBoundary>
        </GetResources>
      </Overlay.Container>
    </Overlay>
  )
}

export default CreateSecretOverlay
