import {startsWith} from 'lodash'

export const isSystemBucket = (bucketName: string): boolean => {
  return startsWith(bucketName, '_')
}

export const BUCKET_OVERLAY_WIDTH = 450

export const BUCKET_NAME_MINIMUM_CHARACTERS = 1
