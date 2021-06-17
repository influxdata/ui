// Libraries
import React, {FC} from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import {useDispatch} from 'react-redux'

// Components
import {
  Button,
  ButtonShape,
  ComponentColor,
  ComponentSize,
} from '@influxdata/clockface'

// Actions
import {notify} from 'src/shared/actions/notifications'

// Notifications
import {
  copyToClipboardSuccess,
  copyToClipboardFailed,
} from 'src/shared/copy/notifications'

// Types
import {Secret} from 'src/types'
import {Context} from 'src/clockface'

interface Props {
  secret: Secret
}

const SecretContextMenu: FC<Props> = ({secret}) => {
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

export default SecretContextMenu