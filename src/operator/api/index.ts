import {
  deleteOperatorAccount,
  deleteOperatorAccountUser,
  getMe as apiGetMe,
  getOperatorAccount,
  getSearchAccount,
  getSearchOrg,
  getOrg,
  getOrgsLimits,
  putOrgsLimits,
} from 'src/client/unityRoutes'
import {
  Account,
  Me,
  Organization,
  Organizations,
  OrgLimits,
} from 'src/types/operator'

const makeResponse = (status, data) => {
  return Promise.resolve({
    status,
    headers: new Headers({'Content-Type': 'application/json'}),
    data,
  })
}

export const getAccounts = (
  searchTerm?: string
): ReturnType<typeof getSearchAccount> => {
  const accounts: Account[] = [
    {
      id: '123',
      marketplace: null,
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
        postalCode: 30000,
      },
      users: [
        {
          id: 'user1',
          quartzId: 'q1',
          onboardingState: 'complete',
          sfdcContactId: 'sdfc_u_know_me',
          firstName: 'jr',
          lastName: 'OG',
          email: 'og@influxdata.com',
          role: 'member',
          links: {
            self: 'www.self.com',
          },
        },
      ],
      type: 'pay_as_you_go',
    },
    {
      id: '345',
      marketplace: {
        shortName: 'aws',
        name: 'Amazon Web Services',
        url: 'smile.amazon.com',
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
        postalCode: 50000,
      },
      users: [],
      type: 'cancelled',
    },
    {
      id: '678',
      marketplace: {
        shortName: 'gcm',
        name: 'Google Cloud Marketplace',
        url: 'www.google.com',
      },
      balance: 20,
      billingContact: {
        companyName: 'Pineapple',
        email: 'desa@influxdata.com',
        firstName: 'Michael',
        lastName: 'De Sa',
        country: 'USA',
        street1: '678 Main St',
        city: 'Seattle',
        subdivision: 'WA',
        postalCode: 80000,
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
): ReturnType<typeof getSearchOrg> => {
  const organizations: Organizations = [
    {
      id: '123',
      idpeID: '123',
      name: 'Best Org',
      region: 'us-west',
      provider: 'Zuora',
      date: '01/01/2010',
      account: {
        id: '123',
        marketplace: null,
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
          postalCode: 30000,
        },
        users: [],
        type: 'pay_as_you_go',
      },
    },
    {
      id: '345',
      idpeID: '345',
      name: 'Second_best_org',
      region: 'eu-central',
      provider: 'aws',
      date: '01/01/2011',
      account: {
        id: '345',
        marketplace: {
          name: 'Amazon Web Services',
          url: 'smile.amazon.com',
          shortName: 'aws',
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
          postalCode: 50000,
        },
        users: [],
        type: 'cancelled',
      },
    },
    {
      id: '678',
      idpeID: '678',
      name: 'Lucky 3',
      region: 'gcp-west',
      provider: 'gcm',
      date: '01/01/2012',
      account: {
        id: '678',
        marketplace: {
          shortName: 'gcm',
          name: 'Google Cloud Marketplace',
          url: 'www.google.com',
        },
        balance: 20,
        billingContact: {
          companyName: 'Pineapple',
          email: 'desa@influxdata.com',
          firstName: 'Michael',
          lastName: 'De Sa',
          country: 'USA',
          street1: '678 Main St',
          city: 'Seattle',
          subdivision: 'WA',
          postalCode: 80000,
        },
        users: [],
        type: 'free',
      },
    },
  ]

  const filtered = organizations.filter(org => {
    if (searchTerm) {
      return org.id.includes(searchTerm) || org.idpeID.includes(searchTerm)
    }
    return true
  })
  return makeResponse(200, filtered)
}

export const getOrgById = (_id: string): ReturnType<typeof getOrg> => {
  const organization: Organization = {
    id: '123',
    idpeID: '123',
    name: 'Best Org',
    region: 'us-west',
    provider: 'Zuora',
    date: '01/01/2010',
    account: {
      id: '123',
      marketplace: null,
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
        postalCode: 30000,
      },
      users: [],
      type: 'pay_as_you_go',
    },
  }

  return makeResponse(200, organization)
}

export const getMe = (): ReturnType<typeof apiGetMe> => {
  const me: Me = {
    id: '123',
    firstName: 'ariel',
    lastName: 'salem',
    email: 'asalem@influxdata.com',
    orgId: 'org123',
    accountId: 'account123',
    isBeta: false,
    isOperator: true,
    marketplace: null,
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
      postalCode: 30000,
    },
    users: [],
    type: 'pay_as_you_go',
  }

  return makeResponse(200, me)
}

export const getAccountById = (
  _id: string
): ReturnType<typeof getOperatorAccount> => {
  const account: Account = {
    id: '345',
    marketplace: {
      name: 'Amazon Web Services',
      url: 'smile.amazon.com',
      shortName: 'aws',
    },
    balance: 10,
    organizations: [
      {
        id: 'orgid',
        idpeID: 'idpeID',
        name: 'name',
        region: 'region',
        provider: 'provider',
        date: '01/01/2021',
        account: null,
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
      postalCode: 50000,
    },
    deletable: true,
    users: [
      {
        id: '1',
        sfdcContactId: '12',
        firstName: 'Ariel',
        lastName: 'Salem',
        email: 'asalem@influxdata.com',
        role: 'member',
        links: {
          self: 'www.self.com',
        },
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

export const removeUserFromAccount = (
  _accountID: string,
  _id: string
): ReturnType<typeof deleteOperatorAccountUser> => {
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
