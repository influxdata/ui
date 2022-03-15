import {Notification} from 'src/types'
import {defaultErrorNotification} from 'src/shared/copy/notifications'

// Subscriptions
export const subscriptionCreateFail = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to create Subscription, please try again.`,
})
