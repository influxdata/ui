// Libraries
import {binaryPrefixFormatter} from '@influxdata/giraffe'

// Types
import {Notification, NotificationStyle} from 'src/types'

// Constants
import {
  FIVE_SECONDS,
  TEN_SECONDS,
  FIFTEEN_SECONDS,
  INDEFINITE,
} from 'src/shared/constants/index'
import {IconFont} from '@influxdata/clockface'

export const bytesFormatter = binaryPrefixFormatter({
  suffix: 'B',
  significantDigits: 2,
  trimZeros: true,
})

type NotificationExcludingMessage = Pick<
  Notification,
  Exclude<keyof Notification, 'message'>
>

const defaultButtonElement = () => null

export const defaultErrorNotification: NotificationExcludingMessage = {
  buttonElement: defaultButtonElement,
  style: NotificationStyle.Error,
  icon: IconFont.AlertTriangle,
  duration: TEN_SECONDS,
}

export const defaultWarningNotification: NotificationExcludingMessage = {
  buttonElement: defaultButtonElement,
  style: NotificationStyle.Warning,
  icon: IconFont.Group,
  duration: TEN_SECONDS,
}

export const defaultSuccessNotification: NotificationExcludingMessage = {
  buttonElement: defaultButtonElement,
  style: NotificationStyle.Success,
  icon: IconFont.CheckMark_New,
  duration: FIVE_SECONDS,
}

export const defaultDeletionNotification: NotificationExcludingMessage = {
  buttonElement: defaultButtonElement,
  style: NotificationStyle.Primary,
  icon: IconFont.Trash_New,
  duration: FIVE_SECONDS,
}

//  Misc Notifications
//  ----------------------------------------------------------------------------

export const copyToClipboardSuccess = (
  text: string,
  title: string = ''
): Notification => ({
  ...defaultSuccessNotification,
  icon: IconFont.Cube,
  type: 'copyToClipboardSuccess',
  message: `${title} '${text}' has been copied to clipboard.`,
})

export const copyToClipboardFailed = (
  text: string,
  title: string = ''
): Notification => ({
  ...defaultErrorNotification,
  message: `${title}'${text}' was not copied to clipboard.`,
})

export const prohibitedDeselect = (message?: string): Notification => ({
  ...defaultErrorNotification,
  message:
    message ?? 'You must have at least one custom aggregate function selected',
})

export const newVersion = (version: string): Notification => ({
  ...defaultSuccessNotification,
  style: NotificationStyle.Info,
  icon: IconFont.CuboUniform,
  message: `Welcome to the latest Chronograf${version}. Local settings cleared.`,
})

export const loadLocalSettingsFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  message: `Loading local settings failed: ${error}`,
})

export const presentationMode = (): Notification => ({
  ...defaultSuccessNotification,
  style: NotificationStyle.Primary,
  icon: IconFont.ExpandB,
  duration: 7500,
  message: 'Press ESC to exit Presentation Mode.',
})

export const sessionTimedOut = (): Notification => ({
  ...defaultSuccessNotification,
  style: NotificationStyle.Primary,
  icon: IconFont.AlertTriangle,
  duration: FIFTEEN_SECONDS,
  message: 'Your session has timed out. Log in again to continue.',
})

export const resultTooLarge = (bytesRead: number): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `Large response truncated to first ${bytesFormatter(bytesRead)}`,
})

export const savingNoteFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `Failed to save note: ${error}`,
})

export const invalidMapType = (): Notification => ({
  ...defaultErrorNotification,
  message: `Variables of type map accept two comma separated values per line`,
})

export const invalidJSON = (message: string): Notification => {
  return {
    ...defaultErrorNotification,
    message: message
      ? `We couldn’t parse the JSON you entered because it failed with message:\n'${message}'`
      : 'We couldn’t parse the JSON you entered because it isn’t valid. Please check the formatting and try again.',
  }
}

export const missingUserInput = (
  reason: string = 'flux was invalid.'
): Notification => ({
  ...defaultErrorNotification,
  message: `Missing user input: ${reason}`,
})

export const autoRefreshTimeoutSuccess = (time?: string): Notification => ({
  ...defaultSuccessNotification,
  duration: INDEFINITE,
  icon: IconFont.Clock_New,
  message: `Your auto refresh settings have been reset due to inactivity ${
    time ? 'over the last' + time : ''
  }`,
})
