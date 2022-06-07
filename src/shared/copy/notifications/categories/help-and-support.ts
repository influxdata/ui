import {Notification} from 'src/types'
import {FIVE_SECONDS} from 'src/shared/constants/index'
import {defaultErrorNotification} from 'src/shared/copy/notifications'

export const supportRequestError = (): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message:
    'There was a problem submitting your support request. Please wait a moment and try again.',
})
