// Libraries
import {normalize} from 'normalizr'
import {Dispatch} from 'react'

// API
import * as api from 'src/client'

// Schemas
import {bucketSchema, arrayOfBuckets} from 'src/schemas'

// Types
import {
  AppState,
  Bucket,
  BucketEntities,
  BucketSchemaMeasurementsResponse,
  GenBucket,
  GetState,
  Label,
  OwnBucket,
  RemoteDataState,
  ResourceType,
} from 'src/types'

// Utils
import {getErrorMessage} from 'src/utils/api'
import {getOrg} from 'src/organizations/selectors'
import {getLabels, getStatus} from 'src/resources/selectors'
import {CLOUD} from 'src/shared/constants'

// Actions
import {
  editBucket,
  addBucket,
  setBuckets,
  removeBucket,
  Action as BucketAction,
} from 'src/buckets/actions/creators'
import {notify, Action as NotifyAction} from 'src/shared/actions/notifications'
import {checkBucketLimits} from 'src/cloud/actions/limits'
import {fetchDemoDataBuckets} from 'src/cloud/apis/demodata'

// Constants
import {
  getBucketsFailed,
  bucketCreateFailed,
  bucketUpdateFailed,
  bucketDeleteFailed,
  bucketUpdateSuccess,
  bucketRenameSuccess,
  bucketRenameFailed,
  addBucketLabelFailed,
  removeBucketLabelFailed,
} from 'src/shared/copy/notifications'
import {BUCKET_LIMIT} from 'src/resources/constants'

type Action = BucketAction | NotifyAction

let getBucketsSchemaMeasurements = null

if (CLOUD) {
  getBucketsSchemaMeasurements = require('src/client/generatedRoutes')
    .getBucketsSchemaMeasurements
}

// todo: probably isn't thunk ? (should be moved to utils or something like that)
export const fetchAllBuckets = async (orgID: string) => {
  const resp = await api.getBuckets({
    query: {orgID, limit: BUCKET_LIMIT},
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

export const getBuckets = () => async (
  dispatch: Dispatch<Action>,
  getState: GetState
) => {
  try {
    const state = getState()
    if (getStatus(state, ResourceType.Buckets) === RemoteDataState.NotStarted) {
      dispatch(setBuckets(RemoteDataState.Loading))
    }
    const org = getOrg(state)

    const buckets = await fetchAllBuckets(org.id)

    dispatch(setBuckets(RemoteDataState.Done, buckets))
  } catch (error) {
    console.error(error)
    dispatch(setBuckets(RemoteDataState.Error))
    dispatch(notify(getBucketsFailed()))
  }
}

export const createBucket = (bucket: OwnBucket) => async (
  dispatch: Dispatch<Action | ReturnType<typeof checkBucketLimits>>,
  getState: GetState
) => {
  try {
    const org = getOrg(getState())

    const resp = await api.postBucket({data: {...bucket, orgID: org.id}})

    if (resp.status !== 201) {
      throw new Error(resp.data.message)
    }

    const newBucket = normalize<Bucket, BucketEntities, string>(
      resp.data,
      bucketSchema
    )

    dispatch(addBucket(newBucket))
    dispatch(checkBucketLimits())
  } catch (error) {
    console.error(error)
    const message = getErrorMessage(error)
    dispatch(notify(bucketCreateFailed(message)))
  }
}

export const createBucketAndUpdate = (
  bucket: OwnBucket,
  update: (bucket: Bucket) => void
) => async (
  dispatch: Dispatch<Action | ReturnType<typeof checkBucketLimits>>,
  getState: GetState
) => {
  try {
    const org = getOrg(getState())

    const resp = await api.postBucket({data: {...bucket, orgID: org.id}})

    if (resp.status !== 201) {
      throw new Error(resp.data.message)
    }

    const newBucket = normalize<Bucket, BucketEntities, string>(
      resp.data,
      bucketSchema
    )

    dispatch(addBucket(newBucket))
    dispatch(checkBucketLimits())
    update(newBucket.entities.buckets[resp.data.id])
  } catch (error) {
    console.error(error)
    const message = getErrorMessage(error)
    dispatch(notify(bucketCreateFailed(message)))
  }
}

// should only be called if in a cloud instance!  not available for OSS!
// everything that calls this should use the if (CLOUD) as a guard
// this is only valid for buckets with an explicit schema type. (implicit is the default)
export const getBucketSchema = (bucketID: string) => async () => {
  try {
    const resp = await getBucketsSchemaMeasurements({
      bucketID,
    })

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }
    return resp.data

  } catch (error) {
    console.error('error while retrieving schemas', error)
    return null
  }
}

export const updateBucket = (bucket: OwnBucket) => async (
  dispatch: Dispatch<Action>,
  getState: GetState
) => {
  try {
    const state = getState()
    const data = denormalizeBucket(state, bucket)

    const resp = await api.patchBucket({
      bucketID: bucket.id,
      data,
    })

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    const newBucket = normalize<Bucket, BucketEntities, string>(
      resp.data,
      bucketSchema
    )

    dispatch(editBucket(newBucket))
    dispatch(notify(bucketUpdateSuccess(bucket.name)))
  } catch (error) {
    console.error(error)
    const message = getErrorMessage(error)
    dispatch(notify(bucketUpdateFailed(message)))
  }
}

export const renameBucket = (originalName: string, bucket: OwnBucket) => async (
  dispatch: Dispatch<Action>,
  getState: GetState
) => {
  try {
    const state = getState()
    const data = denormalizeBucket(state, bucket)

    const resp = await api.patchBucket({
      bucketID: bucket.id,
      data,
    })

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    const newBucket = normalize<Bucket, BucketEntities, string>(
      resp.data,
      bucketSchema
    )

    dispatch(editBucket(newBucket))
    dispatch(notify(bucketRenameSuccess(bucket.name)))
  } catch (error) {
    console.error(error)
    dispatch(notify(bucketRenameFailed(originalName)))
  }
}

export const deleteBucket = (id: string, name: string) => async (
  dispatch: Dispatch<Action | ReturnType<typeof checkBucketLimits>>
) => {
  try {
    const resp = await api.deleteBucket({bucketID: id})

    if (resp.status !== 204) {
      throw new Error(resp.data.message)
    }

    dispatch(removeBucket(id))
    dispatch(checkBucketLimits())
  } catch (error) {
    console.error(error)
    dispatch(notify(bucketDeleteFailed(name)))
  }
}

export const addBucketLabel = (bucketID: string, label: Label) => async (
  dispatch: Dispatch<Action>
): Promise<void> => {
  try {
    const postResp = await api.postBucketsLabel({
      bucketID,
      data: {labelID: label.id},
    })

    if (postResp.status !== 201) {
      throw new Error(postResp.data.message)
    }

    const resp = await api.getBucket({bucketID})

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    const newBucket = normalize<Bucket, BucketEntities, string>(
      resp.data,
      bucketSchema
    )

    dispatch(editBucket(newBucket))
  } catch (error) {
    console.error(error)
    dispatch(notify(addBucketLabelFailed()))
  }
}

export const deleteBucketLabel = (bucketID: string, label: Label) => async (
  dispatch: Dispatch<Action>
): Promise<void> => {
  try {
    const deleteResp = await api.deleteBucketsLabel({
      bucketID,
      labelID: label.id,
    })
    if (deleteResp.status !== 204) {
      throw new Error(deleteResp.data.message)
    }

    const resp = await api.getBucket({bucketID})
    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    const newBucket = normalize<Bucket, BucketEntities, string>(
      resp.data,
      bucketSchema
    )

    dispatch(editBucket(newBucket))
  } catch (error) {
    console.error(error)
    dispatch(notify(removeBucketLabelFailed()))
  }
}

const denormalizeBucket = (state: AppState, bucket: OwnBucket): GenBucket => {
  const labels = getLabels(state, bucket.labels)
  return {
    ...bucket,
    labels,
  }
}
