import {ASSET_LIMIT_ERROR_STATUS} from 'src/cloud/constants/index'
import {LimitStatus} from 'src/cloud/actions/limits'
import {AppState} from 'src/types'
import {CLOUD} from 'src/shared/constants'

export const isLimitError = (error): boolean => {
  if (!CLOUD) {
    return false
  }
  return error?.response?.status === ASSET_LIMIT_ERROR_STATUS
}

export const getBucketLimitStatus = (
  state: AppState
): LimitStatus['status'] => {
  if (!CLOUD) {
    return 'ok'
  }
  return state.cloud?.limits?.buckets?.limitStatus
}

export const extractBucketMax = (state: AppState): number => {
  if (!CLOUD) {
    return Infinity
  }
  return state.cloud?.limits?.buckets?.maxAllowed || Infinity // if maxAllowed == 0, there are no limits on asset
}

export const extractBucketMaxRetentionSeconds = (state: AppState): number => {
  if (!CLOUD) {
    return null
  }
  return state.cloud?.limits?.buckets?.maxRetentionSeconds || null
}

export const getBucketRetentionLimit = (state: AppState): boolean => {
  if (!CLOUD) {
    return false
  }
  const maxSeconds = state.cloud?.limits?.buckets?.maxRetentionSeconds
  return !!maxSeconds
}

export const extractDashboardLimits = (
  state: AppState
): LimitStatus['status'] => {
  if (!CLOUD) {
    return 'ok'
  }
  return state.cloud?.limits?.dashboards?.limitStatus
}

export const extractDashboardMax = (state: AppState): number => {
  if (!CLOUD) {
    return Infinity
  }
  return state.cloud?.limits?.dashboards?.maxAllowed || Infinity
}

export const extractTaskLimits = (state: AppState): LimitStatus['status'] => {
  if (!CLOUD) {
    return 'ok'
  }
  return state.cloud?.limits?.tasks.limitStatus
}

export const extractTaskMax = (state: AppState): number => {
  if (!CLOUD) {
    return Infinity
  }
  return state.cloud?.limits?.tasks?.maxAllowed || Infinity
}

export const extractChecksLimits = (state: AppState): LimitStatus['status'] => {
  if (!CLOUD) {
    return 'ok'
  }
  return state.cloud?.limits?.checks?.limitStatus
}

export const extractChecksMax = (state: AppState): number => {
  if (!CLOUD) {
    return Infinity
  }
  return state.cloud?.limits?.checks?.maxAllowed || Infinity
}

export const extractRulesLimits = (state: AppState): LimitStatus['status'] => {
  if (!CLOUD) {
    return 'ok'
  }
  return state.cloud?.limits?.rules?.limitStatus
}

export const extractRulesMax = (state: AppState): number => {
  if (!CLOUD) {
    return Infinity
  }
  return state.cloud?.limits?.rules?.maxAllowed || Infinity
}

export const extractEndpointsLimits = (
  state: AppState
): LimitStatus['status'] => {
  if (!CLOUD) {
    ;('ok')
  }
  return state.cloud?.limits?.endpoints?.limitStatus
}

export const extractEndpointsMax = (state: AppState): number => {
  if (!CLOUD) {
    return Infinity
  }
  return state.cloud?.limits?.endpoints?.maxAllowed || Infinity
}

export const extractBlockedEndpoints = (state: AppState): string[] => {
  if (!CLOUD) {
    return []
  }
  return state.cloud?.limits?.endpoints.blocked || []
}

export const extractRateLimitStatus = (
  state: AppState
): LimitStatus['status'] => {
  if (!CLOUD) {
    return 'ok'
  }

  const statuses = [
    state.cloud?.limits?.rate?.writeKBs?.limitStatus,
    state.cloud?.limits?.rate?.readKBs?.limitStatus,
    state.cloud?.limits?.rate?.cardinality?.limitStatus,
  ]

  if (statuses.includes('exceeded')) {
    return 'exceeded'
  }

  return 'ok'
}

export const extractRateLimitResources = (state: AppState): string[] => {
  const rateLimitedResources = []

  if (!CLOUD) {
    return rateLimitedResources
  }

  if (state.cloud?.limits?.rate?.readKBs?.limitStatus === 'exceeded') {
    rateLimitedResources.push('read')
  }

  if (state.cloud?.limits?.rate?.writeKBs?.limitStatus === 'exceeded') {
    rateLimitedResources.push('write')
  }

  if (state.cloud?.limits?.rate?.cardinality?.limitStatus === 'exceeded') {
    rateLimitedResources.push('cardinality')
  }

  return rateLimitedResources
}
