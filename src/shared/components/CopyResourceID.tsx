import React, {FC} from 'react'
import {useDispatch} from 'react-redux'

// Notifications
import {notify} from 'src/shared/actions/notifications'
import {
  copyToClipboardSuccess,
  copyToClipboardFailed,
} from 'src/shared/copy/notifications'

// Components
import CopyToClipboard from 'src/shared/components/CopyToClipboard'

interface ResourceWithID {
  id?: string
}

interface ResourceProps {
  resource: ResourceWithID
  resourceName: string
  testID?: string
}

export const CopyResourceID: FC<ResourceProps> = ({
  resource,
  resourceName,
  testID = 'copy-resource-id',
}) => {
  const dispatch = useDispatch()

  const handleCopy = (copiedText: string, copyWasSuccessful: boolean): void => {
    if (!copyWasSuccessful) {
      dispatch(notify(copyToClipboardFailed(copiedText, `${resourceName} ID`)))
      return
    }

    dispatch(notify(copyToClipboardSuccess(copiedText, `${resourceName} ID`)))
  }

  return (
    <CopyToClipboard
      text={resource.id}
      onCopy={handleCopy}
      data-testid={testID}
    >
      <span className="copy-resource-id" title="Click to Copy to Clipboard">
        ID: {resource.id}
        <span className="copy-resource-id--click-target">
          Copy to Clipboard
        </span>
      </span>
    </CopyToClipboard>
  )
}

interface TaskProps {
  taskID: string
  testID?: string
}

export const CopyTaskID: FC<TaskProps> = ({
  taskID,
  testID = 'copy-task-id',
}) => {
  const dispatch = useDispatch()

  const handleCopy = (copiedText: string, copyWasSuccessful: boolean): void => {
    if (!copyWasSuccessful) {
      dispatch(notify(copyToClipboardFailed(copiedText, `Task ID`)))
      return
    }

    dispatch(notify(copyToClipboardSuccess(copiedText, `Task ID`)))
  }

  return (
    <CopyToClipboard text={taskID} onCopy={handleCopy}>
      <span
        className="copy-resource-id"
        title="Click to Copy to Clipboard"
        data-testid={testID}
      >
        Task ID: {taskID}
        <span className="copy-resource-id--click-target">
          Copy to Clipboard
        </span>
      </span>
    </CopyToClipboard>
  )
}
