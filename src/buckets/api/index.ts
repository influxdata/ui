import {normalize} from 'normalizr'

import {getBuckets} from 'src/client'

import {arrayOfBuckets} from 'src/schemas'
import {Bucket, BucketEntities} from 'src/types'

import {BUCKET_LIMIT} from 'src/resources/constants'

export const fetchAllBuckets = async (orgID: string, limit = BUCKET_LIMIT) => {
  const resp = await getBuckets({
    query: {orgID, limit},
  })

  if (resp.status !== 200) {
    throw new Error(resp.data.message)
  }

  return {
    buckets: resp.data.buckets,
    normalizedBuckets: normalize<Bucket, BucketEntities, string[]>(
      [...resp.data.buckets],
      arrayOfBuckets
    ),
  }
}
