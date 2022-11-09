import {Notification} from 'src/types'
import {
  defaultErrorNotification,
  defaultSuccessNotification,
} from 'src/shared/copy/notifications'

// Scripts

export const scriptSaveFail = (scriptName: string): Notification => ({
  ...defaultErrorNotification,
  message: `${scriptName} failed to save`,
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
  message: 'There was an error fetching Scripts. Please try reloading this page',
})
