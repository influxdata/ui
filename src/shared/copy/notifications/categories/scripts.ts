import {Notification} from 'src/types'
import {
  defaultErrorNotification,
  defaultSuccessNotification,
  defaultWarningNotification,
} from 'src/shared/copy/notifications'

// Scripts

export const scriptSaveFail = (
  scriptName: string,
  reason?: string
): Notification => ({
  ...defaultErrorNotification,
  message: `${scriptName} failed to save${reason ? `: ${reason}` : ''}`,
})

export const scriptSaveSuccess = (scriptName: string): Notification => ({
  ...defaultSuccessNotification,
  message: `${scriptName} has been saved`,
})

export const deleteScriptFail = (scriptName: string): Notification => ({
  ...defaultErrorNotification,
  message: `${scriptName} failed to delete`,
})

export const getScriptsFail = (): Notification => ({
  ...defaultErrorNotification,
  message:
    'There was an error fetching Scripts. Please try reloading this page',
})

export const trySmoothingData = (graphType: string): Notification => ({
  ...defaultWarningNotification,
  message: `The ${graphType} graph requires a single column of returned data. Try smoothing data, and toggle for each data field.`,
})
