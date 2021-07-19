import {ASSET_LIMIT_ERROR_STATUS} from 'src/cloud/constants/index'
import {LimitsState} from 'src/cloud/reducers/limits'
import {AppState} from 'src/types'
import {LimitStatus} from 'src/types/cloud'
import {CLOUD} from 'src/shared/constants'

export const isLimitError = (error): boolean => {
  return error?.response?.status === ASSET_LIMIT_ERROR_STATUS
}

export const extractBucketLimits = (
  limits: LimitsState
): LimitStatus['status'] => {
  return CLOUD ? limits.buckets?.limitStatus : 'ok'
}

export const getBucketLimitStatus = (
  state: AppState
): LimitStatus['status'] => {
  return CLOUD ? state.cloud?.limits?.buckets?.limitStatus : 'ok'
}

export const extractBucketMax = (limits: LimitsState): number => {
  return CLOUD ? limits.buckets?.maxAllowed : Infinity // if maxAllowed == 0, there are no limits on asset
}

export const extractBucketMaxRetentionSeconds = (
  limits: LimitsState
): number => {
  return CLOUD ? limits.buckets?.maxRetentionSeconds : null
}

export const getBucketRetentionLimit = (state: AppState): boolean => {
  const maxSeconds = state.cloud?.limits?.buckets?.maxRetentionSeconds
  return CLOUD ? !!maxSeconds : false
}

export const extractDashboardLimits = (
  limits: LimitsState
): LimitStatus['status'] => {
  return CLOUD ? limits?.dashboards?.limitStatus : 'ok'
}

export const extractDashboardMax = (limits: LimitsState): number => {
  return CLOUD ? limits.dashboards?.maxAllowed : Infinity
}

export const extractTaskLimits = (
  limits: LimitsState
): LimitStatus['status'] => {
  return CLOUD ? limits.tasks?.limitStatus : 'ok'
}

export const extractTaskMax = (limits: LimitsState): number => {
  return CLOUD ? limits.tasks?.maxAllowed : Infinity
}

export const extractChecksLimits = (
  limits: LimitsState
): LimitStatus['status'] => {
  return CLOUD ? limits.checks?.limitStatus : 'ok'
}

export const extractChecksMax = (limits: LimitsState): number => {
  return CLOUD ? limits.checks?.maxAllowed : Infinity
}

export const extractRulesLimits = (
  limits: LimitsState
): LimitStatus['status'] => {
  return CLOUD ? limits.rules?.limitStatus : 'ok'
}

export const extractRulesMax = (limits: LimitsState): number => {
  return CLOUD ? limits.rules?.maxAllowed : Infinity
}

export const extractEndpointsLimits = (
  limits: LimitsState
): LimitStatus['status'] => {
  return CLOUD ? limits.endpoints?.limitStatus : 'ok'
}

export const extractEndpointsMax = (limits: LimitsState): number => {
  return CLOUD ? limits.endpoints?.maxAllowed : Infinity
}

export const extractBlockedEndpoints = (limits: LimitsState): string[] => {
  return CLOUD ? limits.endpoints?.blocked : []
}

export const extractRateLimitStatus = (
  limits: LimitsState
): LimitStatus['status'] => {
  if (!CLOUD) {
    return 'ok'
  }

  const statuses = [
    limits.rate.writeKBs.limitStatus,
    limits.rate.readKBs.limitStatus,
    limits.rate.cardinality.limitStatus,
  ]

  if (statuses.includes('exceeded')) {
    return 'exceeded'
  }

  return 'ok'
}

export const extractRateLimitResources = (limits: LimitsState): string[] => {
  const rateLimitedResources = []

  if (!CLOUD) {
    return rateLimitedResources
  }

  if (limits.rate?.readKBs?.limitStatus === 'exceeded') {
    rateLimitedResources.push('read')
  }

  if (limits.rate?.writeKBs?.limitStatus === 'exceeded') {
    rateLimitedResources.push('write')
  }

  if (limits.rate?.cardinality?.limitStatus === 'exceeded') {
    rateLimitedResources.push('cardinality')
  }

  return rateLimitedResources
}
