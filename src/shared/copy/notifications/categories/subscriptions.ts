import {Notification} from 'src/types'
import {defaultErrorNotification} from 'src/shared/copy/notifications'

export const subscriptionCreateFail = (message?: string): Notification => ({
  ...defaultErrorNotification,
  message: message
    ? message
    : `Failed to create Subscription, please try again.`,
})

export const subscriptionUpdateFail = (message?: string): Notification => ({
  ...defaultErrorNotification,
  message: message
    ? message
    : `Failed to update Subscription, please try again.`,
})

export const subscriptionStatusUpdateFail = (
  message?: string
): Notification => ({
  ...defaultErrorNotification,
  message: message
    ? message
    : `Failed to update Subscription status, please try again.`,
})

export const subscriptionsGetFail = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to get Subscriptions, please try again.`,
})

export const subscriptionStatusesGetFail = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to get Subscription Statuses, please try again.`,
})

export const subscriptionsDeleteFail = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to delete the Subscription, please try again.`,
})
