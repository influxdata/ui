// Libraries
import {Dispatch} from 'react'
import {fromFlux} from '@influxdata/giraffe'

// API
import {runQuery} from 'src/shared/apis/query'

// Types
import {AppState, Bucket, GetState, RemoteDataState, Schema} from 'src/types'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {formatTimeRangeArguments} from 'src/timeMachine/apis/queryBuilder'

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

// Types
import {TimeRange} from 'src/types'

type Action = SchemaAction | NotifyAction

export const fetchSchemaForBucket = async (
  bucket: Bucket,
  orgID: string,
  range: string
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
  |> range(${range})
  |> first()
  |> drop(columns: ["_value"])
  |> group()`

  let ni, no
  const filtered = [
    /^_start$/,
    /^_stop$/,
    /^_time$/,
    /^_value/,
    /^_measurement$/,
    /^_field$/,
    /^table$/,
    /^result$/,
  ]
  const res = await runQuery(orgID, text).promise.then(function generateSchema(
    raw
  ) {
    if (raw.type !== 'SUCCESS') {
      throw new Error(raw.message)
    }

    const out = fromFlux(raw.csv).table as any
    const len = out.length
    const measurements = out.columns._measurement?.data
    const fields = out.columns._field?.data
    const columns = out.columnKeys.filter(key => {
      return filtered.reduce((acc, curr) => {
        return acc && !curr.test(key)
      }, true)
    })
    const colLen = columns.length
    const schema = {} as any

    for (ni = 0; ni < len; ni++) {
      if (!schema.hasOwnProperty(measurements[ni])) {
        schema[measurements[ni]] = {
          fields: new Set(),
          tags: {},
        }
      }

      schema[measurements[ni]].fields.add(fields[ni])

      for (no = 0; no < colLen; no++) {
        if (!out.columns[columns[no]].data[ni]) {
          continue
        }

        if (!schema[measurements[ni]].tags.hasOwnProperty(columns[no])) {
          schema[measurements[ni]].tags[columns[no]] = new Set()
        }
        schema[measurements[ni]].tags[columns[no]].add(
          out.columns[columns[no]].data[ni]
        )
      }
    }

    Object.entries(schema).forEach(([key, val]) => {
      schema[key].fields = Array.from((val as any).fields)
    })

    return schema
  })

  return res
}

const getUnexpiredSchema = (state: AppState, bucket: Bucket): Schema | null => {
  const storedSchema = state.flow.schema[bucket.name]

  if (storedSchema?.schema && storedSchema?.exp > Date.now()) {
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

export const getAndSetBucketSchema = (
  bucket: Bucket,
  timeRange: TimeRange
) => async (dispatch: Dispatch<Action>, getState: GetState) => {
  try {
    const state = getState()
    let validCachedResult = null
    if (bucket) {
      validCachedResult = getUnexpiredSchema(state, bucket)
    }
    if (validCachedResult !== null) {
      return
    } else {
      dispatch(setSchema(RemoteDataState.Loading, bucket.name, {}))
    }

    let orgID = getOrg(state).id

    if (bucket.orgID) {
      orgID = bucket.orgID
    }

    const timeRangeArguments = formatTimeRangeArguments(timeRange)
    const schema = await fetchSchemaForBucket(bucket, orgID, timeRangeArguments)

    dispatch(setSchema(RemoteDataState.Done, bucket.name, schema))
  } catch (error) {
    console.error(error)
    dispatch(setSchema(RemoteDataState.Error))
    dispatch(notify(getBucketsFailed()))
  }
}
