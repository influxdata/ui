import {Notification} from 'src/types'
import {FIVE_SECONDS} from 'src/shared/constants/index'
import {
  defaultSuccessNotification,
  defaultErrorNotification,
} from 'src/shared/copy/notifications'

// Operator Notifications
export const getOrgsError = (): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message:
    'There was an error getting the all the organizations, please try again.',
})

export const getOrgError = (id: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `Could not find organization with ID ${id}`,
})

export const getLimitsError = (id: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `Could not fetch limits for the organization ${id}`,
})

export const updateLimitsError = (id: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `Could not update limits for the organization ${id}`,
})

export const updateLimitsSuccess = (id: string): Notification => ({
  ...defaultSuccessNotification,
  duration: FIVE_SECONDS,
  message: `Successfully updated limits for the organization ${id}`,
})

export const getAccountsError = (): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: 'There was an error getting the all the accounts, please try again.',
})

export const getAccountError = (id: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `Could not get the account for ID: ${id}`,
})

export const deleteAccountError = (id: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `Failed to delete the account with the ID ${id}, please try again.`,
})

export const removeUserAccountError = (id: string): Notification => ({
  ...defaultErrorNotification,
  duration: FIVE_SECONDS,
  message: `Failed to remove the user from the account with the ID ${id}, please try again.`,
})
