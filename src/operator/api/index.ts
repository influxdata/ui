import {
  deleteOperatorAccount,
  deleteOperatorAccountsUser,
  getOperatorAccount,
  getOperatorAccounts,
  getOperatorOrg,
  getOperatorOrgs,
  getOrgsLimits,
  putOrgsLimits,
} from 'src/client/unityRoutes'
import {OperatorAccount, OperatorOrg, OrgLimits} from 'src/types'

const makeResponse = (status, data) => {
  return Promise.resolve({
    status,
    headers: new Headers({'Content-Type': 'application/json'}),
    data,
  })
}

export const getAccounts = (
  searchTerm?: string
): ReturnType<typeof getOperatorAccounts> => {
  const accounts: OperatorAccount[] = [
    {
      id: 123,
      marketplaceSubscription: null,
      balance: 0,
      billingContact: {
        companyName: 'Influx',
        email: 'asalem@influxdata.com',
        firstName: 'Ariel',
        lastName: 'Salem',
        country: 'USA',
        street1: '123 Main St',
        city: 'New York',
        subdivision: 'NY',
        postalCode: '30000',
      },
      users: [
        {
          accountId: 123,
          id: 'user1',
          idpeId: 'idpe-123',
          firstName: 'jr',
          lastName: 'OG',
          operator: false,
          sfdcContactId: 'z123',
          onboardingState: 'on',
          email: 'og@influxdata.com',
        },
      ],
      type: 'pay_as_you_go',
    },
    {
      id: 345,
      marketplaceSubscription: {
        marketplace: 'aws',
        status: 'unsubscribed',
        subscriberId: 'aws123',
      },
      balance: 10,
      billingContact: {
        companyName: 'Data',
        email: 'watts@influxdata.com',
        firstName: 'Andrew',
        lastName: 'Watkins',
        country: 'USA',
        street1: '345 Main St',
        city: 'Austin',
        subdivision: 'TX',
        postalCode: '50000',
      },
      users: [],
      type: 'cancelled',
    },
    {
      id: 678,
      marketplaceSubscription: {
        marketplace: 'gcm',
        subscriberId: 'gcm1',
        status: 'subscribed',
      },
      balance: 20,
      billingContact: {
        companyName: 'Pineapple',
        email: 'desa@influxta.com',
        firstName: 'Michael',
        lastName: 'De Sa',
        country: 'USA',
        street1: '678 Main St',
        city: 'Seattle',
        subdivision: 'WA',
        postalCode: '80000',
      },
      users: [],
      type: 'free',
    },
  ]

  const filtered = accounts.filter(account => {
    if (searchTerm) {
      return account.billingContact.email.includes(searchTerm)
    }
    return true
  })
  return makeResponse(200, filtered)
}

export const getOrgs = (
  searchTerm?: string
): ReturnType<typeof getOperatorOrgs> => {
  const organizations: OperatorOrg[] = [
    {
      id: 123,
      idpeId: '12',
      name: 'Best Org',
      region: 'us-west',
      provider: 'Zuora',
      date: '01/01/2010',
      account: {
        type: 'pay_as_you_go',
        balance: 0,
        id: '123',
        email: 'pay@influxdata.com',
      },
      billingContact: null,
    },
    {
      idpeId: '345',
      id: 345,
      name: 'Second_best_org',
      region: 'eu-central',
      provider: 'aws',
      date: '01/01/2011',
      account: {
        type: 'cancelled',
        balance: 0,
        id: '1',
        email: 'cancelled@influxdata.com',
      },
      billingContact: null,
    },
    {
      idpeId: '678',
      id: 678,
      name: 'Lucky 3',
      region: 'gcp-west',
      provider: 'gcm',
      date: '01/01/2012',
      account: {
        type: 'free',
        balance: 0,
        id: '123',
        email: 'free@influxdata.com',
      },
      billingContact: null,
    },
  ]

  const filtered = organizations.filter(org => {
    if (searchTerm) {
      return org.idpeId.includes(searchTerm) || `${org.id}`.includes(searchTerm)
    }
    return true
  })
  return makeResponse(200, filtered)
}

export const getOrgById = (_id: string): ReturnType<typeof getOperatorOrg> => {
  const organization: OperatorOrg = {
    idpeId: '123',
    id: 123,
    name: 'Best Org',
    region: 'us-west',
    provider: 'Zuora',
    date: '01/01/2010',
    account: {
      type: 'pay_as_you_go',
      balance: 10,
      email: 'payg@influxdata.com',
      id: '123',
    },
    billingContact: null,
  }

  return makeResponse(200, organization)
}

export const getAccountById = (
  _id: string
): ReturnType<typeof getOperatorAccount> => {
  const account = {
    id: 345,
    marketplaceSubscription: {
      marketplace: 'aws',
      status: 'unsubscribed',
      subscriberId: 'aws123',
    },
    balance: 10,
    organizations: [
      {
        idpeId: 'orgid',
        id: 1001,
        name: 'name',
        region: 'region',
        provider: 'provider',
        date: '01/01/2021',
        account: {
          type: 'free',
          balance: 0,
          id: 'freeme1',
          email: 'free1@account.com',
        },
        billingContact: {
          companyName: 'Data',
          email: 'watts@influxdata.com',
          firstName: 'Andrew',
          lastName: 'Watkins',
          country: 'USA',
          street1: '345 Main St',
          city: 'Austin',
          subdivision: 'TX',
          postalCode: '50000',
        },
      },
    ],
    billingContact: {
      companyName: 'Data',
      email: 'watts@influxdata.com',
      firstName: 'Andrew',
      lastName: 'Watkins',
      country: 'USA',
      street1: '345 Main St',
      city: 'Austin',
      subdivision: 'TX',
      postalCode: '50000',
    },
    deletable: true,
    users: [
      {
        accountId: 123,
        id: 'user1',
        idpeId: 'idpe-123',
        firstName: 'jr',
        lastName: 'OG',
        operator: false,
        sfdcContactId: 'z123',
        onboardingState: 'on',
        email: 'og@influxdata.com',
      },
    ],
    type: 'cancelled',
  }

  return makeResponse(200, account)
}

export const deleteAccountById = (
  _id: string
): ReturnType<typeof deleteOperatorAccount> => {
  return makeResponse(204, 'ok')
}

export const removeUserFromAccount = ({
  accountID,
  userID,
}): ReturnType<typeof deleteOperatorAccountsUser> => {
  console.warn({accountID, userID})
  return makeResponse(204, 'ok')
}

export const getOrgLimits = (_id: string): ReturnType<typeof getOrgsLimits> => {
  const limits: OrgLimits = {
    orgID: '123',
    rate: {
      readKBs: 1,
      writeKBs: 1,
      cardinality: 1,
    },
    bucket: {
      maxBuckets: 2,
      maxRetentionDuration: Infinity,
    },
    task: {
      maxTasks: 2,
    },
    dashboard: {
      maxDashboards: 2,
    },
    check: {
      maxChecks: 2,
    },
    notificationRule: {
      maxNotifications: 2,
      blockedNotificationRules: 'pagerduty, slack, http',
    },
    notificationEndpoint: {
      blockedNotificationEndpoints: 'pagerduty, slack, http',
    },
  }

  return makeResponse(200, limits)
}

export const updateOrgLimits = (
  _id: string,
  _limits: any
): ReturnType<typeof putOrgsLimits> => {
  const limits: OrgLimits = {
    orgID: '123',
    rate: {
      readKBs: 1,
      writeKBs: 1,
      cardinality: 1,
    },
    bucket: {
      maxBuckets: 2,
      maxRetentionDuration: Infinity,
    },
    task: {
      maxTasks: 2,
    },
    dashboard: {
      maxDashboards: 2,
    },
    check: {
      maxChecks: 2,
    },
    notificationRule: {
      maxNotifications: 2,
      blockedNotificationRules: '',
    },
    notificationEndpoint: {
      blockedNotificationEndpoints: '',
    },
  }

  return makeResponse(200, limits)
}
