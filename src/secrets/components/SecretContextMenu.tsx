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
  IconFont,
} from '@influxdata/clockface'

// Actions
import {notify} from 'src/shared/actions/notifications'

// Notifications
import {
  copyToClipboardFailed,
  copyToClipboardSuccess,
} from 'src/shared/copy/notifications'

// Types
import {Secret} from 'src/types'
import {Context} from 'src/clockface'

// Utils
import {deleteSecret} from 'src/secrets/actions/thunks'
import {event} from 'src/cloud/utils/reporting'

interface Props {
  secret: Secret
}

const SecretContextMenu: FC<Props> = ({secret}) => {
  const dispatch = useDispatch()

  const handleDelete = () => {
    event("Secret Deleted")
    dispatch(deleteSecret(secret))
  }

  const handleCopyAttempt = (
    copiedText: string,
    isSuccessful: boolean
  ): void => {
    event("Copy Secret To Clipboard Clicked")
    if (isSuccessful) {
      dispatch(notify(copyToClipboardSuccess(copiedText, 'Secret ID')))
    } else {
      dispatch(notify(copyToClipboardFailed(copiedText, 'Secret ID')))
    }
  }

  return (
    <Context className="secrets-context-menu">
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
        testID={`delete-secret-initial--${secret.id}`}
        size={ComponentSize.Small}
        color={ComponentColor.Danger}
        icon={IconFont.Trash}
        text="Delete"
        shape={ButtonShape.StretchToFit}
        style={{margin: '4px 0 0 10px'}}
      >
        <Context.Item
          label="Delete"
          action={handleDelete}
          testID={`delete-secret-confirm--${secret.id}`}
        />
      </Context.Menu>
    </Context>
  )
}

export default SecretContextMenu
