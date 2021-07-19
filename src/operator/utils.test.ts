import {OrgLimits} from 'src/types'
import {fromDisplayLimits, toDisplayLimits} from 'src/operator/utils'

describe('converting limits for display', () => {
  const limits: OrgLimits = {
    bucket: {
      maxBuckets: 2,
      maxRetentionDuration: 86400000000000,
    },
    check: {
      maxChecks: 5,
    },
    dashboard: {
      maxDashboards: 3,
    },
    notificationEndpoint: {
      blockedNotificationEndpoints: '',
    },
    notificationRule: {
      blockedNotificationRules: '',
      maxNotifications: 4,
    },
    orgID: 'ID',
    rate: {
      cardinality: 10000,
      readKBs: 100000,
      writeKBs: 1000,
    },
    task: {
      maxTasks: 7,
    },
  }

  it('converts max retention duration from ns to hours', () => {
    const actual = toDisplayLimits(limits)
    const expected = {
      ...limits,
      bucket: {
        ...limits.bucket,
        maxRetentionDuration: 24,
      },
    }

    expect(actual).toEqual(expected)
  })

  it('converts max retention duration from hours to ns', () => {
    const displayLimits = toDisplayLimits(limits)

    expect(fromDisplayLimits(displayLimits)).toEqual(limits)
  })
})
