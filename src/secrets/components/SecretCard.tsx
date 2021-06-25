// Libraries
import React, {FC} from 'react'

// Components
import {AlignItems, FlexDirection, ResourceCard} from '@influxdata/clockface'
import SecretContextMenu from 'src/secrets/components/SecretContextMenu'

// Types
import {Secret} from 'src/types'

// Actions
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

interface Props {
  secret: Secret
  onDeleteSecret: (secret: Secret) => void
  handleEditSecret: (defaultKey: string) => void
}

const SecretCard: FC<Props> = ({secret, handleEditSecret, onDeleteSecret}) => {
  const handleDelete = () => onDeleteSecret(secret)

  const editSecret = () => {
    handleEditSecret(secret.key)
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
          testID={`secret-card--name ${secret.id}`}
          onClick={editSecret}
        />
      </ResourceCard>
    </ErrorBoundary>
  )
}

export default SecretCard
