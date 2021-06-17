// Libraries
import React, {FC} from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {
  Button,
  ButtonShape,
  ComponentColor,
  ComponentSize,
} from '@influxdata/clockface'

// Actions
import {notify as notifyAction} from 'src/shared/actions/notifications'

// Notifications
import {
  copyToClipboardSuccess,
  copyToClipboardFailed,
} from 'src/shared/copy/notifications'

// Types
import {Secret} from 'src/types'
import {Context} from 'src/clockface'

interface OwnProps {
  secret: Secret
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

const SecretContextMenu: FC<Props> = ({secret, notify}) => {
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
    <Context>
      <CopyToClipboard text={secret.id} onCopy={handleCopyAttempt}>
        <Button
          testID={`copy-to-clipboard--${secret.id}`}
          size={ComponentSize.Small}
          color={ComponentColor.Secondary}
          text="Copy to Clipboard"
          className="secret-context-menu--copy-to-clipboard"
          shape={ButtonShape.StretchToFit}
          style={{margin: '4px 0 0 0'}}
        />
      </CopyToClipboard>
    </Context>
  )
}

const mdtp = {
  notify: notifyAction,
}

const connector = connect(null, mdtp)

export default connector(SecretContextMenu)
