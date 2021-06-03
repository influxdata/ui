import {LimitStatus} from 'src/cloud/actions/limits'
export interface Limits {
  rate: {
    readKBs: number
    concurrentReadRequests: number
    writeKBs: number
    concurrentWriteRequests: number
    cardinality: number
  }
  check: {
    maxChecks: number
  }
  notificationRule: {
    maxNotifications: number
    blockedNotificationRules: string
  }
  notificationEndpoint: {
    blockedNotificationEndpoints: string
  }
  bucket: {
    maxBuckets: number
    maxRetentionDuration: number // nanoseconds
  }
  task: {
    maxTasks: number
  }
  dashboard: {
    maxDashboards: number
  }
}

export interface Limit {
  maxAllowed: number
  limitStatus: LimitStatus
}

export interface LimitsStatus {
  read: {
    status: string
  }
  write: {
    status: string
  }
  cardinality: {
    status: string
  }
}
