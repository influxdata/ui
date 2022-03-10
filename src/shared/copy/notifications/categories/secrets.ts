import {Notification} from 'src/types'
import {defaultErrorNotification} from 'src/shared/copy/notifications'

// Secrets
export const getSecretsFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to fetch secrets',
})

export const createSecretFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to create secret',
})

export const upsertSecretFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to create or update secret',
})

export const deleteSecretsFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to delete secret',
})
