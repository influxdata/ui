// Libraries
import {normalize} from 'normalizr'
import {Dispatch} from 'react'

// API
import * as api from 'src/client'

// Schemas
import {bucketSchema} from 'src/schemas'

// Types
import {
  AppState,
  Bucket,
  BucketEntities,
  GenBucket,
  GetState,
  Label,
  OwnBucket,
  RemoteDataState,
  ResourceType,
} from 'src/types'

import {fetchAllBuckets} from 'src/buckets/api'

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
  measurementSchemaAdditionSuccessful,
  measurementSchemaAdditionFailed,
  measurementSchemaUpdateFailed,
  measurementSchemaUpdateSuccessful,
  bucketDeleteSuccess,
} from 'src/shared/copy/notifications'

type Action = BucketAction | NotifyAction

let getBucketsSchemaMeasurements = null,
  MeasurementSchemaCreateRequest = null,
  MeasurementSchemaUpdateRequest = null,
  postBucketsSchemaMeasurement = null,
  patchBucketsSchemaMeasurement = null

if (CLOUD) {
  getBucketsSchemaMeasurements =
    require('src/client/generatedRoutes').getBucketsSchemaMeasurements
  MeasurementSchemaCreateRequest =
    require('src/client/generatedRoutes').MeasurementSchemaCreateRequest
  MeasurementSchemaUpdateRequest =
    require('src/client/generatedRoutes').MeasurementSchemaUpdateRequest
  postBucketsSchemaMeasurement =
    require('src/client/generatedRoutes').postBucketsSchemaMeasurement
  patchBucketsSchemaMeasurement =
    require('src/client/generatedRoutes').patchBucketsSchemaMeasurement
}

export const getBuckets =
  () => async (dispatch: Dispatch<Action>, getState: GetState) => {
    try {
      const state = getState()
      if (
        getStatus(state, ResourceType.Buckets) === RemoteDataState.NotStarted
      ) {
        dispatch(setBuckets(RemoteDataState.Loading))
      }
      const org = getOrg(state)

      let bucketsResponse
      if (CLOUD) {
        // a limit of -1 means fetch all buckets for this org
        bucketsResponse = await fetchAllBuckets(org.id, -1)
      } else {
        bucketsResponse = await fetchAllBuckets(org.id)
      }

      dispatch(
        setBuckets(RemoteDataState.Done, bucketsResponse.normalizedBuckets)
      )
    } catch (error) {
      dispatch(setBuckets(RemoteDataState.Error))
      dispatch(notify(getBucketsFailed()))
    }
  }

export const createBucket =
  (bucket: OwnBucket) =>
  async (
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

export const createBucketAndUpdate =
  (
    bucket: OwnBucket,
    update: (bucket: Bucket) => void,
    schemas: typeof MeasurementSchemaCreateRequest[]
  ) =>
  async (
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

      // just created the bucket, now add any schemas that might be there:
      dispatch(addBucket(newBucket))
      dispatch(checkBucketLimits())

      if (schemas && schemas.length) {
        schemas.forEach(mschemaCreateRequest => {
          addMeasurementSchemaToBucketInternal(
            resp.data.id,
            mschemaCreateRequest,
            org.id,
            resp.data.name,
            dispatch
          )
        })
      }

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

export const updateBucket =
  (bucket: OwnBucket) =>
  async (dispatch: Dispatch<Action>, getState: GetState) => {
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

      const labelsResponse = await api.getBucketsLabels({
        bucketID: bucket.id,
      })

      if (labelsResponse.status !== 200) {
        throw new Error(labelsResponse.data.message)
      }

      const newBucket = normalize<Bucket, BucketEntities, string>(
        Object.assign(resp.data, {labels: labelsResponse.data.labels || []}),
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

export const renameBucket =
  (originalName: string, bucket: OwnBucket) =>
  async (dispatch: Dispatch<Action>, getState: GetState) => {
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

export const deleteBucket =
  (id: string, name: string) =>
  async (dispatch: Dispatch<Action | ReturnType<typeof checkBucketLimits>>) => {
    try {
      const resp = await api.deleteBucket({bucketID: id})

      if (resp.status !== 204) {
        throw new Error(resp.data.message)
      }

      dispatch(removeBucket(id))
      dispatch(checkBucketLimits())
      dispatch(notify(bucketDeleteSuccess()))
    } catch (error) {
      console.error(error)
      dispatch(notify(bucketDeleteFailed(name)))
    }
  }

export const addBucketLabel =
  (bucketID: string, label: Label) =>
  async (dispatch: Dispatch<Action>): Promise<void> => {
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

export const deleteBucketLabel =
  (bucketID: string, label: Label) =>
  async (dispatch: Dispatch<Action>): Promise<void> => {
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

async function addMeasurementSchemaToBucketInternal(
  bucketID: string,
  schema: typeof MeasurementSchemaCreateRequest,
  orgID: string,
  bucketName: string,
  dispatch: Dispatch<Action>
) {
  const params = {
    bucketID,
    data: schema,
    query: {orgID},
  }
  try {
    const resp = await postBucketsSchemaMeasurement(params)
    if (resp.status !== 201) {
      const msg = resp?.data?.message
      console.error('error adding measurement schema:', resp)
      throw new Error(msg)
    }

    dispatch(
      notify(measurementSchemaAdditionSuccessful(bucketName, schema.name))
    )
  } catch (error) {
    console.error(error)
    const message = getErrorMessage(error)
    dispatch(
      notify(measurementSchemaAdditionFailed(bucketName, schema.name, message))
    )
  }
}

export const addSchemaToBucket =
  (
    bucketID: string,
    orgID: string,
    bucketName: string,
    schema: typeof MeasurementSchemaCreateRequest
  ) =>
  (dispatch: Dispatch<Action>) => {
    addMeasurementSchemaToBucketInternal(
      bucketID,
      schema,
      orgID,
      bucketName,
      dispatch
    )
  }

export const updateMeasurementSchema =
  (
    bucketID: string,
    measurementID: string,
    measurementName: string,
    schema: typeof MeasurementSchemaUpdateRequest,
    orgID: string
  ) =>
  async (dispatch: Dispatch<Action>) => {
    const params = {
      bucketID,
      measurementID,
      data: schema,
      query: {orgID},
    }

    try {
      const resp = await patchBucketsSchemaMeasurement(params)
      if (resp.status !== 200) {
        const msg = resp?.data?.message
        throw new Error(msg)
      }
      dispatch(notify(measurementSchemaUpdateSuccessful(measurementName)))
    } catch (error) {
      const message = getErrorMessage(error)
      dispatch(notify(measurementSchemaUpdateFailed(measurementName, message)))
    }
  }

const denormalizeBucket = (state: AppState, bucket: OwnBucket): GenBucket => {
  const labels = getLabels(state, bucket.labels)
  return {
    ...bucket,
    labels,
  } as GenBucket
}
