import {startsWith} from 'lodash'

export const isSystemBucket = (bucketName: string): boolean => {
  return startsWith(bucketName, '_')
}

export const BUCKET_OVERLAY_WIDTH = 400
