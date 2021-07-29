// Libraries
import {get} from 'lodash'
import {getBuckets, getBucket} from 'src/client'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {CLOUD} from 'src/shared/constants'

// Types
import {Bucket, DemoBucket, BucketEntities} from 'src/types'
import {LIMIT} from 'src/resources/constants'
import {normalize} from 'normalizr'
import {bucketSchema} from 'src/schemas'
import {NormalizedSchema} from 'normalizr'

let getExperimentalSampledataBuckets = null
let postExperimentalSampledataBucketsMember = null
let deleteExperimentalSampledataBucketsMembers = null

if (CLOUD) {
  getExperimentalSampledataBuckets = require('src/client')
    .getExperimentalSampledataBuckets
  postExperimentalSampledataBucketsMember = require('src/client')
    .postExperimentalSampledataBucketsMember
  deleteExperimentalSampledataBucketsMembers = require('src/client')
    .deleteExperimentalSampledataBucketsMembers
}

export const getDemoDataBuckets = async (): Promise<Bucket[]> => {
  // todo (deniz) convert to fetch
  if (!CLOUD || !getExperimentalSampledataBuckets) {
    return []
  }
  const resp = await getExperimentalSampledataBuckets({})

  if (resp.status !== 200) {
    throw new Error(resp.data.message)
  }
  // if sampledata endpoints are not available in a cluster
  // gateway responds with a list of links where 'buckets' field is a string
  const buckets = get(resp.data, 'buckets', null)
  if (!Array.isArray(buckets)) {
    throw new Error('Could not reach demodata endpoint')
  }

  return buckets.filter(b => b.type == 'user') as Bucket[] // remove returned _tasks and _monitoring buckets
}

// member's id is looked up from the session token passed with the request.
export const getDemoDataBucketMembership = async (bucketID: string) => {
  if (!CLOUD || !postExperimentalSampledataBucketsMember) {
    return
  }
  const response = await postExperimentalSampledataBucketsMember({
    bucketID,
  })

  if (response.status === 200) {
    // if sampledata route is not available gateway responds with 200 a correct success code is 204
    throw new Error('Could not reach demodata endpoint')
  }

  if (response.status !== 204) {
    throw new Error(response.data.message)
  }
}

export const deleteDemoDataBucketMembership = async (bucketID: string) => {
  if (!CLOUD || !deleteExperimentalSampledataBucketsMembers) {
    return
  }

  try {
    const response = await deleteExperimentalSampledataBucketsMembers({
      bucketID,
    })

    if (response.status === 200) {
      // if sampledata route is not available gateway responds with 200 a correct success code is 204
      throw new Error('Could not reach demodata endpoint')
    }

    if (response.status !== 204) {
      throw new Error(response.data.message)
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const fetchDemoDataBuckets = async (): Promise<Bucket[]> => {
  if (!isFlagEnabled('demodata') || !CLOUD) {
    return []
  }

  try {
    // FindBuckets paginates before filtering for authed buckets until #6591 is resolved,
    // so UI needs to make getBuckets request with demodata orgID parameter
    const demoBuckets = await getDemoDataBuckets()

    const demodataOrgID = get(demoBuckets, '[0].orgID') as string

    if (!demodataOrgID) {
      throw new Error('Could not get demodata orgID')
    }

    const resp = await getBuckets({
      query: {orgID: demodataOrgID, limit: LIMIT},
    })

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    return resp.data.buckets.map(b => ({
      ...b,
      type: 'demodata' as 'demodata',
      labels: [],
    })) as Array<DemoBucket>
  } catch (error) {
    console.error(error)
    return [] // demodata bucket fetching errors should not effect regular bucket fetching
  }
}

export const getNormalizedDemoDataBucket = async (
  bucketID: string
): Promise<NormalizedSchema<BucketEntities, string>> => {
  const resp = await getBucket({bucketID})

  if (resp.status !== 200) {
    throw new Error(
      `Request for demo data bucket membership did not succeed: ${resp.data.message}`
    )
  }

  const newBucket = {
    ...resp.data,
    type: 'demodata' as 'demodata',
    labels: [],
  } as DemoBucket

  const normalizedBucket = normalize<Bucket, BucketEntities, string>(
    newBucket,
    bucketSchema
  )

  return normalizedBucket
}
