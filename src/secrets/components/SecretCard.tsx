// Libraries
import React, {FC} from 'react'
import {useDispatch} from 'react-redux'
import CopyToClipboard from 'react-copy-to-clipboard'

// Components
import {AlignItems, FlexDirection, ResourceCard} from '@influxdata/clockface'
import SecretContextMenu from 'src/secrets/components/SecretContextMenu'

// Types
import {Secret} from 'src/types'

// Actions
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
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
  }

  return (
    <ErrorBoundary>
      <ResourceCard
        key={`secret-id--${secret.id}`}
        testID={`secret-card--${secret.id}`}
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
      </ResourceCard>
    </ErrorBoundary>
  )
}

export default SecretCard
