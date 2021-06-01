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
export interface OrgSetting {
  key: string
  value: string
}

export interface OrgSettings {
  orgID: string
  settings: OrgSetting[]
}

export interface OrgSettingsResponse {
  status: number
  statusText: string
  json: () => Promise<OrgSettings>
}
