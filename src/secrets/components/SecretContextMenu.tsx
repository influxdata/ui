// Libraries
import React, {FC} from 'react'
import {useDispatch} from 'react-redux'

// Components
import {
  ButtonShape,
  ComponentColor,
  ComponentSize,
  ConfirmationButton,
  FlexBox,
  IconFont,
  SquareButton,
} from '@influxdata/clockface'
import CopyToClipboard from 'src/shared/components/CopyToClipboard'

// Actions
import {notify} from 'src/shared/actions/notifications'

// Notifications
import {
  copyToClipboardFailed,
  copyToClipboardSuccess,
} from 'src/shared/copy/notifications'

// Types
import {Secret} from 'src/types'

// Utils
import {deleteSecret} from 'src/secrets/actions/thunks'
import {event} from 'src/cloud/utils/reporting'

interface Props {
  secret: Secret
}

const SecretContextMenu: FC<Props> = ({secret}) => {
  const dispatch = useDispatch()

  const handleDelete = () => {
    event('Secret Deleted')
    dispatch(deleteSecret(secret))
  }

  const handleCopyAttempt = (
    copiedText: string,
    isSuccessful: boolean
  ): void => {
    event('Copy Secret To Clipboard Clicked')
    if (isSuccessful) {
      dispatch(notify(copyToClipboardSuccess(copiedText, 'Secret ID')))
    } else {
      dispatch(notify(copyToClipboardFailed(copiedText, 'Secret ID')))
    }
  }
  return (
    <FlexBox margin={ComponentSize.ExtraSmall}>
      <CopyToClipboard text={secret.id} onCopy={handleCopyAttempt}>
        <SquareButton
          testID={`copy-to-clipboard--${secret.id}`}
          size={ComponentSize.ExtraSmall}
          color={ComponentColor.Colorless}
          icon={IconFont.Clipboard_New}
          shape={ButtonShape.StretchToFit}
          titleText="Copy to clipboard"
        />
      </CopyToClipboard>
      <ConfirmationButton
        color={ComponentColor.Colorless}
        icon={IconFont.Trash_New}
        shape={ButtonShape.Square}
        size={ComponentSize.ExtraSmall}
        confirmationLabel="Yes, delete this secret"
        onConfirm={handleDelete}
        confirmationButtonText="Confirm"
        testID={`context-delete-menu ${secret.id}`}
      />
    </FlexBox>
  )
}

export default SecretContextMenu
