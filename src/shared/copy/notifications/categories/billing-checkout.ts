import {Notification} from 'src/types'
import {FIVE_SECONDS} from 'src/shared/constants/index'
import {defaultErrorNotification} from 'src/shared/copy/notifications'

// Billing Notifications
export const updateBillingSettingsError = (message: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `There was an error updating your billing settings: ${message}`,
})

export const getInvoicesError = (message: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `There was an error getting your invoices: ${message}`,
})

export const getMarketplaceError = (message: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `There was an error getting your marketplace details: ${message}`,
})

export const getBillingInfoError = (message: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `There was an error getting your billing info: ${message}`,
})

export const updateBillingInfoError = (message: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `There was an error updating your billing info: ${message}`,
})

export const billingContactIncompleteError = (): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message:
    'Looks like your billing information is incomplete. Please complete the form before resubmitting.',
})

export const updatePaymentMethodError = (message: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `There was an error updating your payment method: ${message}`,
})

export const accountCancellationError = (message: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `There was an error cancelled your account: ${message}`,
})

// Checkout Notifications
export const submitError = (): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message:
    'There was an error submitting the upgrade request, please try again.',
})

export const getBillingSettingsError = (message: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `There was an error getting your billing settings: ${message}`,
})

/* Billing Notifications */
export const zuoraParamsGetFailure = (message): Notification => ({
  ...defaultErrorNotification,
  message,
})

export const accountSelfDeletionFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: `There was an error deleting the organization, please try again.`,
})
