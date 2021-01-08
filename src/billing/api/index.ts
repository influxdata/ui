import {getBillingAccount as getBillingAccountGenerated} from 'src/client/unityRoutes'

import {RemoteDataState} from 'src/types'
import {OrgLimits} from 'src/types/billing'
import {Account} from 'src/client/unityRoutes'

const makeResponse = (status, data, respName, ...args) => {
  console.log(respName) // eslint-disable-line no-console
  for (let i = 0; i < args.length; i++) {
    console.log(args[i]) // eslint-disable-line no-console
  }

  return Promise.resolve({
    status,
    headers: new Headers({'Content-Type': 'application/json'}),
    data,
  })
}

export const getBillingAccount = (): ReturnType<typeof getBillingAccountGenerated> => {
  const account: Account = {
    id: 1234,
    type: 'free',
    updatedAt: new Date().toString(),
  }
  return makeResponse(200, account, 'getBillingAccount')
}

export const getOrgRateLimits = (): Promise<any> => {
  const orgLimit: OrgLimits = {
    bucket: {
      maxBuckets: 2,
      maxRetentionDuration: 30,
    },
    check: {
      maxChecks: 2,
    },
    dashboard: {
      maxDashboards: 2,
    },
    notificationEndpoint: {
      blockedNotificationEndpoints: 'what',
    },
    notificationRule: {
      blockedNotificationRules: 'what',
      maxNotifications: 2,
    },
    rate: {
      cardinality: 2,
      concurrentReadRequests: 2,
      concurrentWriteRequests: 2,
      readKBs: 2,
      writeKBs: 2,
    },
    status: RemoteDataState.Done,
    task: {
      maxTasks: 2,
    },
  }

  return makeResponse(200, orgLimit, 'getOrgRateLimits')
}
