// Actions
import {notify} from 'src/shared/actions/notifications'

// Constants
import {readLimitReached} from 'src/shared/copy/notifications'

// Types
import {
  Bucket,
  GetState,
  RemoteDataState,
  ResourceType,
  ColumnTypes,
} from 'src/types'
import {
  Limit as Limits,
  LimitStatus as GenLimitStatus,
} from 'src/client/cloudPrivRoutes'
// Selectors
import {
  extractDashboardMax,
  extractBucketMax,
  extractTaskMax,
  extractChecksMax,
  extractRulesMax,
  extractEndpointsMax,
} from 'src/cloud/utils/limits'
import {getOrg} from 'src/organizations/selectors'
import {getAll} from 'src/resources/selectors'
import {CLOUD} from 'src/shared/constants'

let getOrgsLimits = null
let getOrgsLimitsStatus = null

if (CLOUD) {
  getOrgsLimits = require('src/client/cloudPrivRoutes').getOrgsLimits
  getOrgsLimitsStatus =
    require('src/client/cloudPrivRoutes').getOrgsLimitsStatus
}

export interface LimitStatus extends GenLimitStatus {}

export interface Limit {
  maxAllowed: number
  limitStatus: LimitStatus['status']
}

export type MonitoringLimits = {
  [type in ColumnTypes]: LimitStatus['status']
}

export enum ActionTypes {
  SetLimits = 'SET_LIMITS',
  SetLimitsStatus = 'SET_LIMITS_STATUS',
  SetDashboardLimitStatus = 'SET_DASHBOARD_LIMIT_STATUS',
  SetBucketLimitStatus = 'SET_BUCKET_LIMIT_STATUS',
  SetTaskLimitStatus = 'SET_TASK_LIMIT_STATUS',
  SetChecksLimitStatus = 'SET_CHECKS_LIMIT_STATUS',
  SetRulesLimitStatus = 'SET_RULES_LIMIT_STATUS',
  SetEndpointsLimitStatus = 'SET_ENDPOINTS_LIMIT_STATUS',
  SetQueryTimeRateLimitStatus = 'SET_QUERY_TIME_RATE_LIMIT_STATUS',
  SetReadRateLimitStatus = 'SET_READ_RATE_LIMIT_STATUS',
  SetWriteRateLimitStatus = 'SET_WRITE_RATE_LIMIT_STATUS',
  SetCardinalityLimitStatus = 'SET_CARDINALITY_LIMIT_STATUS',
}

export type Actions =
  | SetLimits
  | SetLimitsStatus
  | SetDashboardLimitStatus
  | SetBucketLimitStatus
  | SetTaskLimitStatus
  | SetChecksLimitStatus
  | SetRulesLimitStatus
  | SetEndpointsLimitStatus
  | SetQueryTimeRateLimitStatus
  | SetReadRateLimitStatus
  | SetWriteRateLimitStatus
  | SetCardinalityLimitStatus

export interface SetLimits {
  type: ActionTypes.SetLimits
  payload: {limits: Limits}
}

export const setLimits = (limits: Limits): SetLimits => {
  return {
    type: ActionTypes.SetLimits,
    payload: {limits},
  }
}

export interface SetDashboardLimitStatus {
  type: ActionTypes.SetDashboardLimitStatus
  payload: {limitStatus: LimitStatus['status']}
}

export const setDashboardLimitStatus = (
  limitStatus: LimitStatus['status']
): SetDashboardLimitStatus => {
  return {
    type: ActionTypes.SetDashboardLimitStatus,
    payload: {limitStatus},
  }
}

export interface SetBucketLimitStatus {
  type: ActionTypes.SetBucketLimitStatus
  payload: {limitStatus: LimitStatus['status']}
}

export const setBucketLimitStatus = (
  limitStatus: LimitStatus['status']
): SetBucketLimitStatus => {
  return {
    type: ActionTypes.SetBucketLimitStatus,
    payload: {limitStatus},
  }
}

export interface SetTaskLimitStatus {
  type: ActionTypes.SetTaskLimitStatus
  payload: {limitStatus: LimitStatus['status']}
}

export const setTaskLimitStatus = (
  limitStatus: LimitStatus['status']
): SetTaskLimitStatus => {
  return {
    type: ActionTypes.SetTaskLimitStatus,
    payload: {limitStatus},
  }
}

export interface SetChecksLimitStatus {
  type: ActionTypes.SetChecksLimitStatus
  payload: {limitStatus: LimitStatus['status']}
}

export const setChecksLimitStatus = (
  limitStatus: LimitStatus['status']
): SetChecksLimitStatus => {
  return {
    type: ActionTypes.SetChecksLimitStatus,
    payload: {limitStatus},
  }
}

export interface SetRulesLimitStatus {
  type: ActionTypes.SetRulesLimitStatus
  payload: {limitStatus: LimitStatus['status']}
}

export const setRulesLimitStatus = (
  limitStatus: LimitStatus['status']
): SetRulesLimitStatus => {
  return {
    type: ActionTypes.SetRulesLimitStatus,
    payload: {limitStatus},
  }
}

export interface SetEndpointsLimitStatus {
  type: ActionTypes.SetEndpointsLimitStatus
  payload: {limitStatus: LimitStatus['status']}
}

export const setEndpointsLimitStatus = (
  limitStatus: LimitStatus['status']
): SetEndpointsLimitStatus => {
  return {
    type: ActionTypes.SetEndpointsLimitStatus,
    payload: {limitStatus},
  }
}

export interface SetQueryTimeRateLimitStatus {
  type: ActionTypes.SetQueryTimeRateLimitStatus
  payload: {limitStatus: LimitStatus['status']}
}

export const SetQueryTimeRateLimitStatus = (
  limitStatus: LimitStatus['status']
): SetQueryTimeRateLimitStatus => {
  return {
    type: ActionTypes.SetQueryTimeRateLimitStatus,
    payload: {limitStatus},
  }
}

export interface SetReadRateLimitStatus {
  type: ActionTypes.SetReadRateLimitStatus
  payload: {limitStatus: LimitStatus['status']}
}

export const setReadRateLimitStatus = (
  limitStatus: LimitStatus['status']
): SetReadRateLimitStatus => {
  return {
    type: ActionTypes.SetReadRateLimitStatus,
    payload: {limitStatus},
  }
}

export interface SetWriteRateLimitStatus {
  type: ActionTypes.SetWriteRateLimitStatus
  payload: {limitStatus: LimitStatus['status']}
}

export const setWriteRateLimitStatus = (
  limitStatus: LimitStatus['status']
): SetWriteRateLimitStatus => {
  return {
    type: ActionTypes.SetWriteRateLimitStatus,
    payload: {limitStatus},
  }
}

export interface SetCardinalityLimitStatus {
  type: ActionTypes.SetCardinalityLimitStatus
  payload: {limitStatus: LimitStatus['status']}
}

export const setCardinalityLimitStatus = (
  limitStatus: LimitStatus['status']
): SetCardinalityLimitStatus => {
  return {
    type: ActionTypes.SetCardinalityLimitStatus,
    payload: {limitStatus},
  }
}

export interface SetLimitsStatus {
  type: ActionTypes.SetLimitsStatus
  payload: {
    status: RemoteDataState
  }
}

export const setLimitsStatus = (status: RemoteDataState): SetLimitsStatus => {
  return {
    type: ActionTypes.SetLimitsStatus,
    payload: {status},
  }
}

export const getReadWriteCardinalityLimits =
  () => async (dispatch, getState: GetState) => {
    if (!CLOUD) {
      return
    }
    try {
      const org = getOrg(getState())

      const resp = await getOrgsLimitsStatus({orgID: org.id})

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      const limits = resp.data

      if (limits.read.status === 'exceeded') {
        dispatch(notify(readLimitReached()))
        dispatch(setReadRateLimitStatus('exceeded'))
      } else {
        dispatch(setReadRateLimitStatus('ok'))
      }

      if (limits.write.status === 'exceeded') {
        dispatch(setWriteRateLimitStatus('exceeded'))
      } else {
        dispatch(setWriteRateLimitStatus('ok'))
      }

      if (limits.cardinality.status === 'exceeded') {
        dispatch(setCardinalityLimitStatus('exceeded'))
      } else {
        dispatch(setCardinalityLimitStatus('ok'))
      }
    } catch (error) {
      console.error(error)
    }
  }

export const getAssetLimits = () => async (dispatch, getState: GetState) => {
  if (!CLOUD) {
    return
  }
  dispatch(setLimitsStatus(RemoteDataState.Loading))
  try {
    const org = getOrg(getState())

    const resp = await getOrgsLimits({orgID: org.id})

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    dispatch(setLimits(resp.data))
    dispatch(setLimitsStatus(RemoteDataState.Done))
  } catch (error) {
    console.error(error)
    dispatch(setLimitsStatus(RemoteDataState.Error))
  }
}

export const checkDashboardLimits = () => (dispatch, getState: GetState) => {
  try {
    const state = getState()
    const {resources} = state

    const dashboardsMax = extractDashboardMax(state)
    const dashboardsCount = resources.dashboards.allIDs.length

    if (dashboardsCount >= dashboardsMax) {
      dispatch(setDashboardLimitStatus('exceeded'))
    } else {
      dispatch(setDashboardLimitStatus('ok'))
    }
  } catch (error) {
    console.error(error)
  }
}

export const checkBucketLimits = () => (dispatch, getState: GetState) => {
  try {
    const state = getState()
    const allBuckets = getAll<Bucket>(state, ResourceType.Buckets)
    const bucketsMax = extractBucketMax(state)
    const buckets = allBuckets.filter(bucket => {
      return bucket.type == 'user'
    })
    const bucketsCount = buckets.length

    if (bucketsCount >= bucketsMax) {
      dispatch(setBucketLimitStatus('exceeded'))
    } else {
      dispatch(setBucketLimitStatus('ok'))
    }
  } catch (error) {
    console.error(error)
  }
}

export const checkTaskLimits = () => (dispatch, getState: GetState) => {
  try {
    const state = getState()
    const tasksMax = extractTaskMax(state)
    const tasksCount = state.resources.tasks.allIDs.length

    if (tasksCount >= tasksMax) {
      dispatch(setTaskLimitStatus('exceeded'))
    } else {
      dispatch(setTaskLimitStatus('ok'))
    }
  } catch (error) {
    console.error(error)
  }
}

export const checkChecksLimits = () => (dispatch, getState: GetState) => {
  try {
    const state = getState()

    const checksMax = extractChecksMax(state)
    const checksCount = state.resources.checks.allIDs.length
    if (checksCount >= checksMax) {
      dispatch(setChecksLimitStatus('exceeded'))
    } else {
      dispatch(setChecksLimitStatus('ok'))
    }
  } catch (error) {
    console.error(error)
  }
}

export const checkRulesLimits = () => (dispatch, getState: GetState) => {
  try {
    const state = getState()

    const rulesMax = extractRulesMax(state)
    const rulesCount = state.resources.rules.allIDs.length

    if (rulesCount >= rulesMax) {
      dispatch(setRulesLimitStatus('exceeded'))
    } else {
      dispatch(setRulesLimitStatus('ok'))
    }
  } catch (error) {
    console.error(error)
  }
}

export const checkEndpointsLimits = () => (dispatch, getState: GetState) => {
  try {
    const state = getState()
    const endpointsCount = state.resources.endpoints.allIDs.length
    const endpointsMax = extractEndpointsMax(state)

    if (endpointsCount >= endpointsMax) {
      dispatch(setEndpointsLimitStatus('exceeded'))
    } else {
      dispatch(setEndpointsLimitStatus('ok'))
    }
  } catch (error) {
    console.error(error)
  }
}
