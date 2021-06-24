// Libraries
import React, {FC} from 'react'

// Components
import {Overlay} from '@influxdata/clockface'
import CreateSecretForm from 'src/secrets/components/CreateSecretForm'

// Types
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import GetResources from 'src/resources/components/GetResources'
import {Secret, ResourceType} from 'src/types'

interface Props {
    isVisible: boolean
    createSecret: (secret: Secret) => void
    onDismiss: () => void
    onKeyValidation: (key: string) => string | null
}

const CreateSecretOverlay: FC<Props> = ({isVisible, createSecret, onDismiss, onKeyValidation}) => {

    return (
        <Overlay visible={isVisible}>
            <Overlay.Container maxWidth={750}>
                <Overlay.Header
                    title="Add Secret"
                    onDismiss={onDismiss}
                    testID="create-secret-overlay-header"
                />
                <Overlay.Body>
                    <GetResources resources={[ResourceType.Secrets]}>
                        <ErrorBoundary>
                            <CreateSecretForm onHideOverlay={onDismiss} createSecret={createSecret} onKeyValidation={onKeyValidation}/>
                        </ErrorBoundary>
                    </GetResources>
                </Overlay.Body>
            </Overlay.Container>
        </Overlay>
    )

}

export default CreateSecretOverlay