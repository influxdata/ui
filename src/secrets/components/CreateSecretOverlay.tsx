// Libraries
import React, {FC} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {Overlay} from '@influxdata/clockface'
import CreateSecretForm from 'src/secrets/components/CreateSecretForm'

// Types
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import GetResources from 'src/resources/components/GetResources'
import {ResourceType} from 'src/types'
import {getOrg} from 'src/organizations/selectors'

const CreateSecretOverlay: FC = () => {
  const history = useHistory()
  const orgId = useSelector(getOrg).id

  return (
    <Overlay visible={true}>
      <Overlay.Container maxWidth={750}>
        <Overlay.Header
          title="Add Secret"
          onDismiss={() => history.push(`/orgs/${orgId}/settings/secrets`)}
          testID="modify-secret-overlay-header"
        />
        <Overlay.Body>
          <GetResources resources={[ResourceType.Secrets]}>
            <ErrorBoundary>
              <CreateSecretForm />
            </ErrorBoundary>
          </GetResources>
        </Overlay.Body>
      </Overlay.Container>
    </Overlay>
  )
}

export default CreateSecretOverlay
