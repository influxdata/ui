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
