// Libraries
import React, {FC} from 'react'

// Components
import {Overlay} from '@influxdata/clockface'
import ModifySecretForm from 'src/secrets/components/ModifySecretForm'

// Types
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import GetResources from 'src/resources/components/GetResources'
import {Secret, ResourceType} from 'src/types'

interface Props {
    isVisible: boolean
    handleUpsertSecret: (secret: Secret) => void
    onDismiss: () => void
    mode: string
    defaultKey: string
    onKeyValidation: (key: string) => string | null
}

const ModifySecretOverlay: FC<Props> = ({isVisible, handleUpsertSecret, onDismiss, onKeyValidation, mode, defaultKey}) => {
    const headerTitle = (mode === "CREATE") ? "Add Secret" : "Edit Secret"

    return (
        <Overlay visible={isVisible}>
            <Overlay.Container maxWidth={750}>
                <Overlay.Header
                    title={headerTitle}
                    onDismiss={onDismiss}
                    testID="modify-secret-overlay-header"
                />
                <Overlay.Body>
                    <GetResources resources={[ResourceType.Secrets]}>
                        <ErrorBoundary>
                            <ModifySecretForm onHideOverlay={onDismiss} handleUpsertSecret={handleUpsertSecret} onKeyValidation={onKeyValidation} mode={mode} defaultKey={defaultKey}/>
                        </ErrorBoundary>
                    </GetResources>
                </Overlay.Body>
            </Overlay.Container>
        </Overlay>
    )
}

export default ModifySecretOverlay