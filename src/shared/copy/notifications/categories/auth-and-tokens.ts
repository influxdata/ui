import {Notification} from 'src/types'
import {
  defaultErrorNotification,
  defaultSuccessNotification,
} from 'src/shared/copy/notifications'

export const authorizationsGetFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to get API tokens',
})

export const authorizationCreateSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'API token was created successfully',
})

export const passwordResetSuccessfully = (message: string): Notification => ({
  ...defaultSuccessNotification,
  message: `${message}
    If you haven't received an email, please ensure that the email you provided is correct.`,
})

export const authorizationCreateFailed = (
  errorMessage?: string
): Notification => {
  const defaultMsg = 'Failed to create API tokens'
  const message = errorMessage ? `${defaultMsg}: ${errorMessage}` : defaultMsg
  return {
    ...defaultErrorNotification,
    message,
  }
}

export const authorizationUpdateSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'API token was updated successfully',
})

export const authorizationUpdateFailed = (desc: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to update API token: "${desc}"`,
})

export const authorizationDeleteSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'API token was deleted successfully',
})

export const authorizationDeleteFailed = (desc: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to delete API token: "${desc}"`,
})

export const bulkAuthorizationDeleteSuccess = (
  numberOfTokens: number
): Notification => ({
  ...defaultSuccessNotification,
  message: `${numberOfTokens} API ${
    numberOfTokens > 1 ? 'tokens were' : 'token'
  } deleted successfully`,
})

export const bulkAuthorizationDeleteFailed = (desc: string): Notification => ({
  ...defaultErrorNotification,
  message: `We couldn't delete ${desc} tokens you selected. Please check the list and try again. If the problem persists, contact support.`,
})

export const authorizationCopySuccess = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'API token has been copied to clipboard',
})

export const authorizationCopyFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to copy API token to clipboard',
})
