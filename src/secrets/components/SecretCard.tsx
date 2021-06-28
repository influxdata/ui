// Libraries
import React, {FC} from 'react'
<<<<<<< HEAD
=======
import {useDispatch} from 'react-redux'
import CopyToClipboard from 'react-copy-to-clipboard'
>>>>>>> 13f44092cb7d2b696603ceac41cf78b9877e0998

// Components
import {AlignItems, FlexDirection, ResourceCard} from '@influxdata/clockface'
import SecretContextMenu from 'src/secrets/components/SecretContextMenu'

// Types
import {Secret} from 'src/types'

// Actions
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
<<<<<<< HEAD

interface Props {
  secret: Secret
  onDeleteSecret: (secret: Secret) => void
  handleEditSecret: (defaultKey: string) => void
}

const SecretCard: FC<Props> = ({secret, handleEditSecret, onDeleteSecret}) => {
  const handleDelete = () => onDeleteSecret(secret)

  const editSecret = () => {
    handleEditSecret(secret.key)
=======
import {notify} from 'src/shared/actions/notifications'
import {
  copyToClipboardFailed,
  copyToClipboardSuccess,
} from 'src/shared/copy/notifications'

interface Props {
  secret: Secret
}

const SecretCard: FC<Props> = ({secret}) => {
  const dispatch = useDispatch()

  const handleCopyAttempt = (
    copiedText: string,
    isSuccessful: boolean
  ): void => {
    if (isSuccessful) {
      dispatch(notify(copyToClipboardSuccess(copiedText, 'Secret ID')))
    } else {
      dispatch(notify(copyToClipboardFailed(copiedText, 'Secret ID')))
    }
>>>>>>> 13f44092cb7d2b696603ceac41cf78b9877e0998
  }

  return (
    <ErrorBoundary>
      <ResourceCard
        key={`secret-id--${secret.id}`}
        testID={`secret-card--${secret.id}`}
<<<<<<< HEAD
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
=======
        contextMenu={<SecretContextMenu secret={secret} />}
        direction={FlexDirection.Row}
        alignItems={AlignItems.Center}
      >
        <CopyToClipboard text={secret.id} onCopy={handleCopyAttempt}>
          <ResourceCard.Name
            name={secret.id}
            testID={`secret-card--name ${secret.id}`}
          />
        </CopyToClipboard>
>>>>>>> 13f44092cb7d2b696603ceac41cf78b9877e0998
      </ResourceCard>
    </ErrorBoundary>
  )
}

export default SecretCard
