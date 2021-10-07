import {startsWith} from 'lodash'

export const isSystemBucket = (bucketName: string): boolean => {
  return startsWith(bucketName, '_')
}

export const BUCKET_OVERLAY_WIDTH = 475

export const BUCKET_NAME_MINIMUM_CHARACTERS = 1

export const CREATE_A_BUCKET_ID = 'create-a-bucket'

export const createBucketOption = {
  id: CREATE_A_BUCKET_ID,
  name: '+ Create A Bucket',
}
