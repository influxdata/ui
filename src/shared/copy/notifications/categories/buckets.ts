import {Notification, NotificationButtonElement} from 'src/types'
import {TEN_SECONDS} from 'src/shared/constants/index'
import {
  defaultErrorNotification,
  defaultSuccessNotification,
} from 'src/shared/copy/notifications'

// Buckets
export const getBucketsFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to fetch buckets',
})

export const getBucketFailed = (
  bucketID: string,
  error: string
): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to fetch bucket with id ${bucketID}: ${error}`,
})

export const getSchemaFailed = (
  bucketName: string,
  error: string
): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to fetch schema for bucket with id ${bucketName}: ${error}`,
})

export const updateAggregateType = (
  message: string,
  buttonElement?: NotificationButtonElement
): Notification => ({
  ...defaultErrorNotification,
  message,
  buttonElement,
  duration: TEN_SECONDS,
  type: 'aggregateTypeError',
})

export const bucketRenameSuccess = (bucketName: string): Notification => ({
  ...defaultSuccessNotification,
  message: `Bucket was successfully renamed "${bucketName}"`,
})

export const bucketRenameFailed = (bucketName: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to rename bucket "${bucketName}"`,
})

export const addBucketLabelFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to add label to bucket',
})

export const removeBucketLabelFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to remove label from bucket',
})

export const bucketDeleteFailed = (bucketName: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to delete bucket: "${bucketName}"`,
})

export const bucketDeleteSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'Bucket was deleted successfully',
})

export const bucketCreateSuccess = (): Notification => ({
  ...defaultSuccessNotification,
  message: 'Bucket was successfully created',
})

export const bucketCreateFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to create bucket: ${error}`,
})

export const bucketUpdateSuccess = (bucketName: string): Notification => ({
  ...defaultSuccessNotification,
  message: `Bucket "${bucketName}" was successfully updated`,
})

export const bucketUpdateFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to update bucket: "${error}"`,
})

export const measurementSchemaAdditionSuccessful = (
  bucketName: string,
  schemaName: string
): Notification => ({
  ...defaultSuccessNotification,
  message: `MeasurementSchema ${schemaName}  has been successfully added to bucket ${bucketName}`,
})

export const measurementSchemaUpdateSuccessful = (
  measurementName: string
): Notification => ({
  ...defaultSuccessNotification,
  message: `MeasurementSchema ${measurementName}  has been successfully updated`,
})

export const measurementSchemaAdditionFailed = (
  bucketName: string,
  schemaName: string,
  errorMsg: string
): Notification => ({
  ...defaultErrorNotification,
  message: `MeasurementSchema ${schemaName}  has *not* been successfully added to bucket ${bucketName}, error: ${errorMsg}`,
})

export const measurementSchemaUpdateFailed = (
  measurementName: string,
  errorMsg: string
): Notification => ({
  ...defaultErrorNotification,
  message: `MeasurementSchema ${measurementName}  has *not* been successfully updated, error: ${errorMsg}`,
})
