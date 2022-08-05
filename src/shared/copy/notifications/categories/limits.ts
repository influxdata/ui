import {Notification, NotificationStyle} from 'src/types'
import {FIVE_SECONDS, TEN_SECONDS} from 'src/shared/constants/index'
import {
  defaultErrorNotification,
  defaultSuccessNotification,
} from 'src/shared/copy/notifications'
import {IconFont} from '@influxdata/clockface'

// Constants
import {CLOUD} from 'src/shared/constants'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Limits
export const readWriteCardinalityLimitReached = (
  message: string
): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to write data due to plan limits: ${message}`,
  duration: FIVE_SECONDS,
  type: 'readWriteCardinalityLimitReached',
})

export const readLimitReached = (): Notification => ({
  ...defaultErrorNotification,
  message: `Exceeded query limits.`,
  duration: FIVE_SECONDS,
  type: 'readLimitReached',
})

export const rateLimitReached = (secs?: number): Notification => {
  const retryText = ` Please try again in ${secs} seconds`
  return {
    ...defaultErrorNotification,
    message: `Exceeded rate limits.${secs ? retryText : ''} `,
    duration: FIVE_SECONDS,
    type: 'rateLimitReached',
  }
}

export const writeLimitReached = (
  message: string,
  Button: any,
  duration?: number
) => ({
  ...defaultErrorNotification,
  icon:
    CLOUD && isFlagEnabled('credit250Experiment')
      ? IconFont.AlertTriangle
      : defaultErrorNotification.icon,
  message,
  duration: duration ?? TEN_SECONDS,
  type: 'writeLimitReached',
  style: NotificationStyle.Secondary,
  buttonElement: () => Button,
})

export const resourceLimitReached = (resourceName: string): Notification => ({
  ...defaultErrorNotification,
  message: `Oops. It looks like you have reached the maximum number of ${resourceName} allowed as part of your plan. If you would like to upgrade and remove this restriction, reach out to support@influxdata.com.`,
  duration: FIVE_SECONDS,
  type: 'resourceLimitReached',
})

export const queryCancelRequest = (): Notification => ({
  ...defaultSuccessNotification,
  message: `Query cancelled.`,
})
