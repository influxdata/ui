import {Notification} from 'src/types'
import {
  defaultErrorNotification,
  defaultSuccessNotification,
} from 'src/shared/copy/notifications'

// Functions
export const functionGetFail = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to fetch functions`,
})

export const functionCreateFail = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to create function. Please try again`,
})

export const functionDeleteFail = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to delete function. Please try again`,
})

export const functionTriggerFail = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to trigger function run. Please try again`,
})

export const runGetFail = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to fetch runs for this function`,
})

export const functionUpdateFail = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to save function. Please try again`,
})

export const copyFunctionURL = (): Notification => ({
  ...defaultSuccessNotification,
  message: `Copied function URL to clipboard`,
  duration: 2000,
})
