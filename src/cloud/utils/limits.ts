import {get} from 'lodash'
import {ASSET_LIMIT_ERROR_STATUS} from 'src/cloud/constants/index'
import {LimitsState} from 'src/cloud/reducers/limits'
import {AppState, LimitStatus} from 'src/types'

export const isLimitError = (error): boolean => {
  return get(error, 'response.status', '') === ASSET_LIMIT_ERROR_STATUS
}

export const extractBucketLimits = (
  limits: LimitsState
): LimitStatus['status'] => {
  return get(limits, 'buckets.limitStatus')
}

export const getBucketLimitStatus = (
  state: AppState
): LimitStatus['status'] => {
  return state.cloud?.limits?.buckets?.limitStatus
}

export const extractBucketMax = (limits: LimitsState): number => {
  return get(limits, 'buckets.maxAllowed') || Infinity // if maxAllowed == 0, there are no limits on asset
}

export const extractBucketMaxRetentionSeconds = (
  limits: LimitsState
): number => {
  return get(limits, 'buckets.maxRetentionSeconds', null)
}

export const getBucketRetentionLimit = (state: AppState): boolean => {
  const maxSeconds = state.cloud?.limits?.buckets?.maxRetentionSeconds
  return !!maxSeconds
}

export const extractDashboardLimits = (
  limits: LimitsState
): LimitStatus['status'] => {
  return get(limits, 'dashboards.limitStatus')
}
export const extractDashboardMax = (limits: LimitsState): number => {
  return get(limits, 'dashboards.maxAllowed') || Infinity
}

export const extractTaskLimits = (
  limits: LimitsState
): LimitStatus['status'] => {
  return get(limits, 'tasks.limitStatus')
}
export const extractTaskMax = (limits: LimitsState): number => {
  return get(limits, 'tasks.maxAllowed') || Infinity
}

export const extractChecksLimits = (
  limits: LimitsState
): LimitStatus['status'] => {
  return get(limits, 'checks.limitStatus')
}
export const extractChecksMax = (limits: LimitsState): number => {
  return get(limits, 'checks.maxAllowed') || Infinity
}

export const extractRulesLimits = (
  limits: LimitsState
): LimitStatus['status'] => {
  return get(limits, 'rules.limitStatus')
}
export const extractRulesMax = (limits: LimitsState): number => {
  return get(limits, 'rules.maxAllowed') || Infinity
}
export const extractBlockedRules = (limits: LimitsState): string[] => {
  return get(limits, 'rules.blocked') || []
}

export const extractEndpointsLimits = (
  limits: LimitsState
): LimitStatus['status'] => {
  return get(limits, 'endpoints.limitStatus')
}
export const extractEndpointsMax = (limits: LimitsState): number => {
  return get(limits, 'endpoints.maxAllowed') || Infinity
}
export const extractBlockedEndpoints = (limits: LimitsState): string[] => {
  return get(limits, 'endpoints.blocked') || []
}

export const extractLimitedMonitoringResources = (
  limits: LimitsState
): string => {
  const rateLimitedResources = []

  if (get(limits, 'checks.limitStatus') === 'exceeded') {
    rateLimitedResources.push('checks')
  }

  if (get(limits, 'rules.limitStatus') === 'exceeded') {
    rateLimitedResources.push('rules')
  }

  if (get(limits, 'endpoints.limitStatus') === 'exceeded') {
    rateLimitedResources.push('endpoints')
  }

  return rateLimitedResources.join(', ')
}

export const extractRateLimitStatus = (
  limits: LimitsState
): LimitStatus['status'] => {
  const statuses = [
    get(limits, 'rate.writeKBs.limitStatus'),
    get(limits, 'rate.readKBs.limitStatus'),
    get(limits, 'rate.cardinality.limitStatus'),
  ]

  if (statuses.includes('exceeded')) {
    return 'exceeded'
  }

  return 'ok'
}

export const extractRateLimitResources = (limits: LimitsState): string[] => {
  const rateLimitedResources = []

  if (get(limits, 'rate.readKBs.limitStatus') === 'exceeded') {
    rateLimitedResources.push('read')
  }

  if (get(limits, 'rate.writeKBs.limitStatus') === 'exceeded') {
    rateLimitedResources.push('write')
  }

  if (get(limits, 'rate.cardinality.limitStatus') === 'exceeded') {
    rateLimitedResources.push('cardinality')
  }

  return rateLimitedResources
}
