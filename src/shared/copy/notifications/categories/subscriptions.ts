import {Notification} from 'src/types'
import {defaultErrorNotification} from 'src/shared/copy/notifications'

// Subscriptions
export const subscriptionCreateFail = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to create Subscription, please try again.`,
})

export const subscriptionUpdateFail = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to update Subscription, please try again.`,
})

export const subscriptionStatusUpdateFail = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to update Subscription status, please try again.`,
})
