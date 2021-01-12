import {
  getBillingAccount as getBillingAccountGenerated,
  getBillingPaymentMethods,
  getBillingCc,
} from 'src/client/unityRoutes'

import {RemoteDataState} from 'src/types'
import {
  Invoices,
  CreditCardParams,
  OrgLimits,
  LimitStatus,
  Region,
  BillingNotifySettings,
  PaymentMethods,
} from 'src/types/billing'
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
    balance: 100,
    billingContact: {
      companyName: 'InfluxDB',
      email: 'info@influxdata.com',
      firstName: 'Boatie',
      lastName: 'McBoatface',
      country: 'USA',
      street1: '123 Powers St',
      subdivision: 'NY',
      city: 'Brooklyn',
      postalCode: 30000,
    },
    deletable: false,
    marketplaceSubscription: {
      marketplace: 'us-west',
      subscriberId: 'id123',
      status: 'paid',
    },
    type: 'pay_as_you_go',
    updatedAt: new Date().toString(),
    users: [{}],
    zuoraAccountId: 'zID123',
  }
  return makeResponse(200, account, 'getBillingAccount')
}

export const getPaymentMethods = (): ReturnType<typeof getBillingPaymentMethods> => {
  const account: PaymentMethods = [
    {
      cardType: 'Visa',
      cardNumber: '4242424242424242',
      expirationMonth: '04',
      expirationYear: '22',
      defaultPaymentMethod: true,
    },
    {
      cardType: 'MasterCard',
      cardNumber: '5242424242424242',
      expirationMonth: '05',
      expirationYear: '25',
      defaultPaymentMethod: false,
    },
  ]
  return makeResponse(200, account, 'getPaymentMethods')
}

export const getBillingCreditCard = (): ReturnType<typeof getBillingCc> => {
  const cc: CreditCardParams = {
    id: 'id123',
    tenantID: 'tenant123',
    key: 'key123',
    signature: 'John Hancock',
    token: 't0k3n',
    style: 'fresh',
    submitEnabled: 'true',
    url: 'you-are-el',
  }
  return makeResponse(200, cc, 'getBillingCreditCard')
}

export const getBillingNotificationSettings = (): ReturnType<typeof getBillingAccountGenerated> => {
  const account: BillingNotifySettings = {
    isNotify: true,
    balanceThreshold: 1000000,
    notifyEmail: 'asalem@influxdata.com',
    status: RemoteDataState.Done,
  }
  return makeResponse(200, account, 'getBillingNotificationSettings')
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

export const getLimitsStatus = (): Promise<any> => {
  const limitsStatus: LimitStatus = {
    read: {
      status: 'exceeded',
    },
    write: {
      status: 'exceeded',
    },
    cardinality: {
      status: 'exceeded',
    },
    status: RemoteDataState.Done,
  }

  return makeResponse(200, limitsStatus, 'getLimitsStatus')
}

export const getInvoices = (): Promise<any> => {
  const invoices: Invoices = [
    {
      amount: 0,
      filesID: 'abc123',
      status: 'status-fied',
      targetDate: new Date().toString(),
    },
    {
      amount: 10,
      filesID: '10E->405N',
      status: 'cruise',
      targetDate: new Date().toString(),
    },
    {
      amount: 405,
      filesID: '405N->101N',
      status: 'traffic',
      targetDate: new Date().toString(),
    },
    {
      amount: 101,
      filesID: '101N->1N',
      status: 'more_traffic',
      targetDate: new Date().toString(),
    },
    {
      amount: 1,
      filesID: '1N',
      status: 'traffic_with_view',
      targetDate: new Date().toString(),
    },
  ]

  return makeResponse(200, invoices, 'getInvoicesStatus')
}

export const getRegion = (): Promise<any> => {
  const region: Region = {
    title: 'EU Frankfurt',
    isBeta: false,
    isAvailable: true,
    provider: 'AWS',
    region: 'us-west',
    status: RemoteDataState.Done,
  }

  return makeResponse(200, region, 'getRegion')
}
