// Libraries
import React, {FC} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import CopyToClipboard from 'react-copy-to-clipboard'

// Components
import {AlignItems, FlexDirection, ResourceCard} from '@influxdata/clockface'
import SecretContextMenu from 'src/secrets/components/SecretContextMenu'

// Types
import {Secret} from 'src/types'

// Actions
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import {notify as notifyAction} from 'src/shared/actions/notifications'
import {
  copyToClipboardFailed,
  copyToClipboardSuccess,
} from 'src/shared/copy/notifications'

interface OwnProps {
  secret: Secret
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

const SecretCard: FC<Props> = ({secret, notify}) => {
  const handleCopyAttempt = (
    copiedText: string,
    isSuccessful: boolean
  ): void => {
    if (isSuccessful) {
      notify(copyToClipboardSuccess(copiedText, 'Secret ID'))
    } else {
      notify(copyToClipboardFailed(copiedText, 'Secret ID'))
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

const mdtp = {
  notify: notifyAction,
}

const connector = connect(null, mdtp)

export default connector(SecretCard)
