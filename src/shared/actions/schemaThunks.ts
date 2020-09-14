// Libraries
import {Dispatch} from 'react'
import {fromFluxWithSchema} from '@influxdata/giraffe'

// API
import {runQuery} from 'src/shared/apis/query'

// Types
import {AppState, Bucket, GetState, RemoteDataState, Schema} from 'src/types'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {getSchemaByBucketName} from 'src/shared/selectors/schemaSelectors'

// Actions
import {
  resetSchema,
  setSchema,
  Action as SchemaAction,
} from 'src/shared/actions/schemaCreator'
import {notify, Action as NotifyAction} from 'src/shared/actions/notifications'

// Constants
import {getBucketsFailed} from 'src/shared/copy/notifications'
import {TEN_MINUTES} from 'src/shared/reducers/schema'

type Action = SchemaAction | NotifyAction

export const fetchSchemaForBucket = async (
  bucket: Bucket,
  orgID: string
): Promise<Schema> => {
  /*
    -4d here is an arbitrary time range that fulfills the need to overfetch a bucket's meta data
    rather than underfetching the data. At the time of writing this comment, a timerange is
    prerequisite for querying a bucket's metadata and is therefore required here.

    If overfetching provides too much overhead / comes at a performance cost down the line,
    we should reduce the range / come up with an alternative to allow for querying a bucket's metadata
    without having to provide a range
  */

  const text = `from(bucket: "${bucket.name}")
  |> range(start: -4d)
  |> first()`

  const res = await runQuery(orgID, text)
    .promise.then(raw => {
      if (raw.type !== 'SUCCESS') {
        throw new Error(raw.message)
      }

      return raw
    })
    .then(raw => fromFluxWithSchema(raw.csv).schema)

  return res
}

const getUnexpiredSchema = (state: AppState, bucket: Bucket): Schema | null => {
  const storedSchema = getSchemaByBucketName(state, bucket.name)

  if (storedSchema?.schema && storedSchema?.exp > new Date().getTime()) {
    return storedSchema.schema
  } else {
    return null
  }
}

export const startWatchDog = () => (dispatch: Dispatch<Action>) => {
  setInterval(() => {
    dispatch(resetSchema())
  }, TEN_MINUTES / 2)

  dispatch(resetSchema())
}

export const getAndSetBucketSchema = (bucket: Bucket) => async (
  dispatch: Dispatch<Action>,
  getState: GetState
) => {
  try {
    const state = getState()
    let validCachedResult = null
    if (bucket) {
      validCachedResult = getUnexpiredSchema(state, bucket)
    }
    if (validCachedResult !== null) {
      dispatch(setSchema(RemoteDataState.Done, bucket.name, validCachedResult))
      return
    } else {
      dispatch(setSchema(RemoteDataState.Loading, bucket.name, {}))
    }
    let orgID = getOrg(state).id
    if (bucket.orgID) {
      orgID = bucket.orgID
    }
    const schema = await fetchSchemaForBucket(bucket, orgID)
    dispatch(setSchema(RemoteDataState.Done, bucket.name, schema))
  } catch (error) {
    console.error(error)
    dispatch(setSchema(RemoteDataState.Error))
    dispatch(notify(getBucketsFailed()))
  }
}
