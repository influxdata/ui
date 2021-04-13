import React, {FC} from 'react'
import {useDispatch} from 'react-redux'
import CopyToClipboard from 'react-copy-to-clipboard'

// Notifications
import {notify} from 'src/shared/actions/notifications'
import {
  copyToClipboardSuccess,
  copyToClipboardFailed,
} from 'src/shared/copy/notifications'

interface ResourceWithID {
  id?: string
}

interface Props {
  resource: ResourceWithID
  resourceName: string
}

export const CopyResourceID: FC<Props> = ({resource, resourceName}) => {
  const dispatch = useDispatch()

  const handleCopy = (copiedText: string, copyWasSuccessful: boolean): void => {
    if (!copyWasSuccessful) {
      dispatch(notify(copyToClipboardFailed(copiedText, `${resourceName} ID`)))
      return
    }

    dispatch(notify(copyToClipboardSuccess(copiedText, `${resourceName} ID`)))
  }

  return (
    <CopyToClipboard text={resource.id} onCopy={handleCopy}>
      <span className="copy-resource-id" title="Click to Copy to Clipboard">
        ID: {resource.id}
        <span className="copy-resource-id--click-target">
          Copy to Clipboard
        </span>
      </span>
    </CopyToClipboard>
  )
}
