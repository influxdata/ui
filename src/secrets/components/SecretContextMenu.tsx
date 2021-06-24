// Libraries
import React, {FC} from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import {useDispatch} from 'react-redux'

// Components
import {Button, ButtonShape, ComponentColor, ComponentSize, IconFont,} from '@influxdata/clockface'

// Actions
import {notify} from 'src/shared/actions/notifications'

// Notifications
import {copyToClipboardFailed, copyToClipboardSuccess,} from 'src/shared/copy/notifications'

// Types
import {Secret} from 'src/types'
import {Context} from 'src/clockface'

interface Props {
  secret: Secret
  onDeleteSecret: () => void
}

const SecretContextMenu: FC<Props> = ({secret, onDeleteSecret}) => {
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

  // Note to self: add a class on the context element to push everything left about
  // 20 pixels because there's no padding on the rightmost button for reasons
  return (
    <Context className={'secrets-context-menu'}>
      <CopyToClipboard text={secret.id} onCopy={handleCopyAttempt}>
        <Button
          testID={`copy-to-clipboard--${secret.id}`}
          size={ComponentSize.Small}
          color={ComponentColor.Secondary}
          text="Copy to Clipboard"
          shape={ButtonShape.StretchToFit}
          style={{margin: '4px 0 0 0'}}
        />
      </CopyToClipboard>
      <Context.Menu
        testID={`delete-secret-context--${secret.id}`}
        size={ComponentSize.Small}
        color={ComponentColor.Danger}
        icon={IconFont.Trash}
        text="Delete"
        shape={ButtonShape.StretchToFit}
        style={{margin: '4px 0 0 10px'}}
      >
        <Context.Item
          label="Delete"
          action={onDeleteSecret}
          testID={`context-delete-secret--${secret.id}`}
        />
      </Context.Menu>
    </Context>
  )
}

export default SecretContextMenu
