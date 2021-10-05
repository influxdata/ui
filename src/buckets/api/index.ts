import {normalize} from 'normalizr'

import {getBuckets} from 'src/client'
import {fetchDemoDataBuckets} from 'src/cloud/apis/demodata'

import {arrayOfBuckets} from 'src/schemas'
import {Bucket, BucketEntities} from 'src/types'

import {CLOUD} from 'src/shared/constants'
import {BUCKET_LIMIT} from 'src/resources/constants'

export const fetchAllBuckets = async (orgID: string, limit = BUCKET_LIMIT) => {
  const resp = await getBuckets({
    query: {orgID, limit},
  })

  if (resp.status !== 200) {
    throw new Error(resp.data.message)
  }

  let demoDataBuckets = []

  if (CLOUD) {
    demoDataBuckets = await fetchDemoDataBuckets()
  }

  return normalize<Bucket, BucketEntities, string[]>(
    [...resp.data.buckets, ...demoDataBuckets],
    arrayOfBuckets
  )
}
