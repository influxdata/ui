import {startsWith} from 'lodash'

export const isSystemBucket = (bucketName: string): boolean => {
  return startsWith(bucketName, '_')
}
