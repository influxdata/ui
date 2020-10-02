// libraries
import {Dispatch} from 'react'
import moment from 'moment'

// api
import {postDelete} from 'src/client'
import {runQuery} from 'src/shared/apis/query'
import {extractBoxedCol} from 'src/timeMachine/apis/queryBuilder'

// utils
import fromFlux from 'src/shared/utils/fromFlux'

// actions
import {
  Action,
  resetPredicateState,
  setBucketName,
  setFiles,
  setDeletionStatus,
  setKeys,
  setPreviewStatus,
  setValues,
} from 'src/shared/actions/predicates'
import {notify} from 'src/shared/actions/notifications'

// selectors
import {getOrg} from 'src/organizations/selectors'
import {getVariables, asAssignment} from 'src/variables/selectors'
import {buildVarsOption} from 'src/variables/utils/buildVarsOption'
import {getWindowVars} from 'src/variables/utils/getWindowVars'

// constants
import {
  predicateDeleteFailed,
  predicateDeleteSucceeded,
  rateLimitReached,
  resultTooLarge,
  setFilterKeyFailed,
  setFilterValueFailed,
} from 'src/shared/copy/notifications'

// types
import {Filter, GetState, RemoteDataState} from 'src/types'

const formatFilters = (filters: Filter[]) =>
  filters.map(f => `${f.key} ${f.equality} ${f.value}`).join(' AND ')

export const deleteWithPredicate = () => async (
  dispatch: Dispatch<Action>,
  getState: GetState
) => {
  dispatch(setDeletionStatus(RemoteDataState.Loading))

  const {
    predicates: {timeRange, bucketName, filters},
  } = getState()
  const orgID = getOrg(getState()).id

  const data = {
    start: moment(timeRange.lower).toISOString(),
    stop: moment(timeRange.upper).toISOString(),
  }

  if (filters.length > 0) {
    data['predicate'] = formatFilters(filters)
  }

  try {
    const resp = await postDelete({
      data,
      query: {
        orgID,
        bucket: bucketName,
      },
    })

    if (resp.status !== 204) {
      throw new Error(resp.data.message)
    }

    dispatch(setDeletionStatus(RemoteDataState.Done))
    dispatch(notify(predicateDeleteSucceeded()))
    dispatch(resetPredicateState())
  } catch {
    dispatch(notify(predicateDeleteFailed()))
    dispatch(setDeletionStatus(RemoteDataState.Error))
    dispatch(resetPredicateState())
  }
}

export const executePreviewQuery = (query: string) => async (
  dispatch,
  getState: GetState
) => {
  dispatch(setPreviewStatus(RemoteDataState.Loading))
  try {
    const state = getState()
    const orgID = getOrg(state).id

    // TODO figure out how to do this better
    // for some reason we can't use the time range variables
    // for preview query, which means we can't use getAllVariables
    // which means we have to drag around all this asAssignment
    // garbage to be able to run a query instead of just being able
    // to executeQuery as normal
    const variableAssignments = getVariables(state)
      .map(v => asAssignment(v))
      .filter(v => !!v)
    const windowVars = getWindowVars(query, variableAssignments)
    const extern = buildVarsOption([...variableAssignments, ...windowVars])
    const result = await runQuery(orgID, query, extern).promise

    if (result.type === 'UNKNOWN_ERROR') {
      throw new Error(result.message)
    }

    if (result.type === 'RATE_LIMIT_ERROR') {
      dispatch(notify(rateLimitReached(result.retryAfter)))

      throw new Error(result.message)
    }

    if (result.didTruncate) {
      dispatch(notify(resultTooLarge(result.bytesRead)))
    }

    // TODO: this is just here for validation. since we are already eating
    // the cost of parsing the results, we should store the output instead
    // of the raw input
    fromFlux(result.csv)

    const files = [result.csv]
    dispatch(setFiles(files))
  } catch (e) {
    if (e.name === 'CancellationError') {
      return
    }

    console.error(e)
    dispatch(setPreviewStatus(RemoteDataState.Error))
  }
}

export const setBucketAndKeys = (bucketName: string) => async (
  dispatch: Dispatch<Action>,
  getState: GetState
) => {
  const orgID = getOrg(getState()).id

  try {
    const query = `import "influxdata/influxdb/v1"
    v1.tagKeys(bucket: "${bucketName}")
    |> filter(fn: (r) => r._value != "_stop" and r._value != "_start")`
    const keys = await extractBoxedCol(runQuery(orgID, query), '_value').promise
    keys.sort()
    dispatch(setBucketName(bucketName))
    dispatch(setKeys(keys))
  } catch {
    dispatch(notify(setFilterKeyFailed()))
    dispatch(setDeletionStatus(RemoteDataState.Error))
  }
}

export const setValuesByKey = (bucketName: string, keyName: string) => async (
  dispatch: Dispatch<Action>,
  getState: GetState
) => {
  const orgID = getOrg(getState()).id

  try {
    const query = `import "influxdata/influxdb/v1" v1.tagValues(bucket: "${bucketName}", tag: "${keyName}")`
    const values = await extractBoxedCol(runQuery(orgID, query), '_value')
      .promise
    values.sort()
    dispatch(setValues(values))
  } catch {
    dispatch(notify(setFilterValueFailed()))
    dispatch(setDeletionStatus(RemoteDataState.Error))
  }
}
