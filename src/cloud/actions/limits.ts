// API
import {getOrgsLimits, getOrgsLimitsStatus} from 'src/client/cloudPrivRoutes'

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
  Limits as CloudLimits,
  LimitStatus as CloudLimitStatus,
} from 'src/types/cloud'

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

interface OSSLimitStatus {
  status: 'ok' | 'exceeded'
}

export type MonitoringLimits = {
  [type in ColumnTypes]: CloudLimitStatus['status'] | OSSLimitStatus['status']
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
  | SetReadRateLimitStatus
  | SetWriteRateLimitStatus
  | SetCardinalityLimitStatus

interface OSSLimits {
  orgID?: string
  rate: {
    readKBs: number
    concurrentReadRequests: number
    writeKBs: number
    concurrentWriteRequests: number
    cardinality: number
  }
  bucket: {
    maxBuckets: number
    maxRetentionDuration: number
  }
  task: {
    maxTasks: number
  }
  dashboard: {
    maxDashboards: number
  }
  check: {
    maxChecks: number
  }
  notificationRule: {
    maxNotifications: number
    blockedNotificationRules?: string
  }
  notificationEndpoint: {
    blockedNotificationEndpoints?: string
  }
  features?: {
    allowDelete?: boolean
  }
}

export interface SetLimits {
  type: ActionTypes.SetLimits
  payload: {limits: CloudLimits | OSSLimits}
}

export const setLimits = (limits: CloudLimits | OSSLimits): SetLimits => {
  return {
    type: ActionTypes.SetLimits,
    payload: {limits},
  }
}

export interface SetDashboardLimitStatus {
  type: ActionTypes.SetDashboardLimitStatus
  payload: {limitStatus: CloudLimitStatus['status'] | OSSLimitStatus['status']}
}

export const setDashboardLimitStatus = (
  limitStatus: CloudLimitStatus['status'] | OSSLimitStatus['status']
): SetDashboardLimitStatus => {
  return {
    type: ActionTypes.SetDashboardLimitStatus,
    payload: {limitStatus},
  }
}

export interface SetBucketLimitStatus {
  type: ActionTypes.SetBucketLimitStatus
  payload: {limitStatus: CloudLimitStatus['status'] | OSSLimitStatus['status']}
}

export const setBucketLimitStatus = (
  limitStatus: CloudLimitStatus['status'] | OSSLimitStatus['status']
): SetBucketLimitStatus => {
  return {
    type: ActionTypes.SetBucketLimitStatus,
    payload: {limitStatus},
  }
}

export interface SetTaskLimitStatus {
  type: ActionTypes.SetTaskLimitStatus
  payload: {limitStatus: CloudLimitStatus['status'] | OSSLimitStatus['status']}
}

export const setTaskLimitStatus = (
  limitStatus: CloudLimitStatus['status'] | OSSLimitStatus['status']
): SetTaskLimitStatus => {
  return {
    type: ActionTypes.SetTaskLimitStatus,
    payload: {limitStatus},
  }
}

export interface SetChecksLimitStatus {
  type: ActionTypes.SetChecksLimitStatus
  payload: {limitStatus: CloudLimitStatus['status'] | OSSLimitStatus['status']}
}

export const setChecksLimitStatus = (
  limitStatus: CloudLimitStatus['status'] | OSSLimitStatus['status']
): SetChecksLimitStatus => {
  return {
    type: ActionTypes.SetChecksLimitStatus,
    payload: {limitStatus},
  }
}

export interface SetRulesLimitStatus {
  type: ActionTypes.SetRulesLimitStatus
  payload: {limitStatus: CloudLimitStatus['status'] | OSSLimitStatus['status']}
}

export const setRulesLimitStatus = (
  limitStatus: CloudLimitStatus['status'] | OSSLimitStatus['status']
): SetRulesLimitStatus => {
  return {
    type: ActionTypes.SetRulesLimitStatus,
    payload: {limitStatus},
  }
}

export interface SetEndpointsLimitStatus {
  type: ActionTypes.SetEndpointsLimitStatus
  payload: {limitStatus: CloudLimitStatus['status'] | OSSLimitStatus['status']}
}

export const setEndpointsLimitStatus = (
  limitStatus: CloudLimitStatus['status'] | OSSLimitStatus['status']
): SetEndpointsLimitStatus => {
  return {
    type: ActionTypes.SetEndpointsLimitStatus,
    payload: {limitStatus},
  }
}

export interface SetReadRateLimitStatus {
  type: ActionTypes.SetReadRateLimitStatus
  payload: {limitStatus: CloudLimitStatus['status'] | OSSLimitStatus['status']}
}

export const setReadRateLimitStatus = (
  limitStatus: CloudLimitStatus['status'] | OSSLimitStatus['status']
): SetReadRateLimitStatus => {
  return {
    type: ActionTypes.SetReadRateLimitStatus,
    payload: {limitStatus},
  }
}

export interface SetWriteRateLimitStatus {
  type: ActionTypes.SetWriteRateLimitStatus
  payload: {limitStatus: CloudLimitStatus['status'] | OSSLimitStatus['status']}
}

export const setWriteRateLimitStatus = (
  limitStatus: CloudLimitStatus['status'] | OSSLimitStatus['status']
): SetWriteRateLimitStatus => {
  return {
    type: ActionTypes.SetWriteRateLimitStatus,
    payload: {limitStatus},
  }
}

export interface SetCardinalityLimitStatus {
  type: ActionTypes.SetCardinalityLimitStatus
  payload: {limitStatus: CloudLimitStatus['status'] | OSSLimitStatus['status']}
}

export const setCardinalityLimitStatus = (
  limitStatus: CloudLimitStatus['status'] | OSSLimitStatus['status']
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

export const getReadWriteCardinalityLimits = () => async (
  dispatch,
  getState: GetState
) => {
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
  dispatch(setLimitsStatus(RemoteDataState.Loading))
  try {
    const org = getOrg(getState())

    const resp = await getOrgsLimits({orgID: org.id})

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    const limits: CloudLimits = resp.data

    dispatch(setLimits(limits))
    dispatch(setLimitsStatus(RemoteDataState.Done))
  } catch (error) {
    console.error(error)
    dispatch(setLimitsStatus(RemoteDataState.Error))
  }
}

export const checkDashboardLimits = () => (dispatch, getState: GetState) => {
  try {
    const state = getState()
    const {
      cloud: {limits},
      resources,
    } = state

    const dashboardsMax = extractDashboardMax(limits)
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
    const {
      cloud: {limits},
    } = state
    const allBuckets = getAll<Bucket>(state, ResourceType.Buckets)
    const bucketsMax = extractBucketMax(limits)
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
    const {
      cloud: {limits},
      resources,
    } = getState()
    const tasksMax = extractTaskMax(limits)
    const tasksCount = resources.tasks.allIDs.length

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
    const {
      resources,
      cloud: {limits},
    } = getState()

    const checksMax = extractChecksMax(limits)
    const checksCount = resources.checks.allIDs.length
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
    const {
      resources,
      cloud: {limits},
    } = getState()

    const rulesMax = extractRulesMax(limits)
    const rulesCount = resources.rules.allIDs.length

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
    const endpointsMax = extractEndpointsMax(state.cloud.limits)

    if (endpointsCount >= endpointsMax) {
      dispatch(setEndpointsLimitStatus('exceeded'))
    } else {
      dispatch(setEndpointsLimitStatus('ok'))
    }
  } catch (error) {
    console.error(error)
  }
}
