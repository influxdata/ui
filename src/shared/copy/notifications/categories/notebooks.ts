import {Notification} from 'src/types'
import {
  defaultErrorNotification,
  defaultSuccessNotification,
} from 'src/shared/copy/notifications'

// Notebooks

export const notebookRunFail = (projectName: string): Notification => ({
  ...defaultErrorNotification,
  message: `${projectName} run failed`,
})

export const panelCopyLinkSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  message: `Panel link copied successfully!`,
})

export const panelCopyLinkFail = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to copy the panel link`,
})

export const notebookCreateFail = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to create Notebook, please try again.`,
})

export const notebookUpdateFail = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to save changes to Notebook, please try again.`,
})

export const notebookDeleteFail = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to delete Notebook, please try again.`,
})

export const notebookDeleteSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'Notebook was deleted successfully',
})

export const notebookEditFail = (message: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to edit Notebook: ${message}`,
})

export const csvUploaderErrorNotification = (
  message: string
): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to upload the selected CSV: ${message}`,
})

export const csvUploadCancelled = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'Successfully cancelled CSV Upload',
})

export const publishNotebookSuccessful = (name: string): Notification => ({
  ...defaultSuccessNotification,
  message: `Successfully saved this version to ${name}'s version history.`,
})

export const publishNotebookFailed = (name: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to save this version to ${name}'s version history`,
})
