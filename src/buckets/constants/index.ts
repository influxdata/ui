import {CLOUD} from 'src/shared/constants'

export const isSystemBucket = (bucketName: string): boolean => {
  return bucketName.startsWith('_')
}

export const getBucketOverlayWidth = () => {
  if (CLOUD) {
    return 650
  }
  return 450
}

export const BUCKET_NAME_MINIMUM_CHARACTERS = 1

export const CREATE_A_BUCKET_ID = 'create-a-bucket'

export const createBucketOption = {
  id: CREATE_A_BUCKET_ID,
  name: '+ Create A Bucket',
}
