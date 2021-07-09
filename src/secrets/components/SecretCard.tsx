// Libraries
import React, {FC} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {AlignItems, FlexDirection, ResourceCard} from '@influxdata/clockface'
import SecretContextMenu from 'src/secrets/components/SecretContextMenu'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

// Types
import {Secret} from 'src/types'

// Utils
import {getOrg} from 'src/organizations/selectors'

interface Props {
  secret: Secret
  onDeleteSecret: (secret: Secret) => void
}

const SecretCard: FC<Props> = ({secret, onDeleteSecret}) => {
  const handleDelete = () => onDeleteSecret(secret)
  const history = useHistory()
  const orgId = useSelector(getOrg).id

  const editSecret = () => {
    history.push(`orgs/${orgId}/settings/secrets/${secret.key}/edit`)
  }

  return (
    <ErrorBoundary>
      <ResourceCard
        key={`secret-id--${secret.id}`}
        testID={`secret-card--${secret.id}`}
        contextMenu={
          <SecretContextMenu secret={secret} onDeleteSecret={handleDelete} />
        }
        direction={FlexDirection.Row}
        alignItems={AlignItems.Center}
      >
        <ResourceCard.Name
          name={secret.id}
          testID={`secret-card--name-${secret.id}`}
          onClick={editSecret}
        />
      </ResourceCard>
    </ErrorBoundary>
  )
}

export default SecretCard
