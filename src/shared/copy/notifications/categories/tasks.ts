import {Notification} from 'src/types'
import {FIVE_SECONDS} from 'src/shared/constants/index'
import {
  defaultErrorNotification,
  defaultSuccessNotification,
} from 'src/shared/copy/notifications'

//  Task Notifications
//  ----------------------------------------------------------------------------
export const addTaskLabelFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to add label to task',
})

export const removeTaskLabelFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to remove label from task',
})

// Labels
export const getLabelsFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to fetch labels',
})

export const createLabelFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to create label: ${error}`,
})

export const updateLabelFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to update label: ${error}`,
})

export const deleteLabelFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to delete label: ${error}`,
})

export const taskNotCreated = (additionalMessage: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to create new task: ${additionalMessage}`,
})

export const taskCreatedSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'New task created successfully',
})

export const taskNotFound = (additionalMessage: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to find task: ${additionalMessage}`,
})

export const tasksFetchFailed = (additionalMessage: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to get tasks from server: ${additionalMessage}`,
})

export const taskDeleteFailed = (additionalMessage: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to delete task: ${additionalMessage}`,
})

export const taskDeleteSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'Task was deleted successfully',
})

export const taskCloneSuccess = (taskName: string): Notification => ({
  ...defaultSuccessNotification,
  message: `Successfully cloned task ${taskName}`,
})

export const taskCloneFailed = (
  taskName: string,
  additionalMessage: string
): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to clone task ${taskName}: ${additionalMessage} `,
})

export const taskUpdateFailed = (
  additionalMessage: string,
  taskName?: string
): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to update task ${
    taskName ? taskName : ''
  }: ${additionalMessage}`,
})

export const taskUpdateSuccess = (taskName?: string): Notification => ({
  ...defaultSuccessNotification,
  message: `Task ${taskName ? taskName : ''} was updated successfully`,
})

export const taskImportFailed = (errorMessage: string): Notification => ({
  ...defaultErrorNotification,
  duration: undefined,
  message: `Failed to import Task: ${errorMessage}.`,
})

export const taskImportSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  duration: FIVE_SECONDS,
  message: `Successfully imported task.`,
})

export const taskRunSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  duration: FIVE_SECONDS,
  message: 'Task scheduled successfully',
})

export const taskRunFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `Failed to run task: ${error}`,
})

export const taskGetFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `Failed to get runs: ${error}`,
})

export const taskRetrySuccess = (id: string): Notification => ({
  ...defaultSuccessNotification,
  duration: FIVE_SECONDS,
  message: `Task run ${id} successfully scheduled`,
})

export const taskRetryFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `Failed to retry Task: ${error}`,
})
