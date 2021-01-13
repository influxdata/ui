import {
  getBillingAccount as getBillingAccountGenerated,
  getBillingNotifySettings,
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

const makeResponse = (status, data) => {
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
      status: 'Paid',
    },
    type: 'free',
    updatedAt: new Date().toString(),
    users: [{}],
    zuoraAccountId: 'zID123',
  }
  return makeResponse(200, account)
}

export const getPaymentMethods = (): ReturnType<typeof getBillingPaymentMethods> => {
  const paymentMethods: PaymentMethods = [
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
  return makeResponse(200, paymentMethods)
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
  return makeResponse(200, cc)
}

export const getBillingNotificationSettings = (): ReturnType<typeof getBillingNotifySettings> => {
  const billingNotifySettings: BillingNotifySettings = {
    isNotify: true,
    balanceThreshold: 1000000,
    notifyEmail: 'asalem@influxdata.com',
    status: RemoteDataState.Done,
  }
  return makeResponse(200, billingNotifySettings)
}

export const getOrgRateLimits = (): Promise<any> => {
  const orgLimit: OrgLimits = {
    bucket: {
      maxBuckets: 2,
      maxRetentionDuration: 1555000000000000,
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

  return makeResponse(200, orgLimit)
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

  return makeResponse(200, limitsStatus)
}

export const getInvoices = (): Promise<any> => {
  const invoices: Invoices = [
    {
      amount: 0,
      filesID: 'abc123',
      status: 'Paid',
      targetDate: new Date('01/01/2020').toString(),
    },
    {
      amount: 10,
      filesID: '10E->405N',
      status: 'Unpaid',
      targetDate: new Date('01/02/2020').toString(),
    },
    {
      amount: 405,
      filesID: '405N->101N',
      status: 'Paid',
      targetDate: new Date('01/03/2020').toString(),
    },
    {
      amount: 101,
      filesID: '101N->1N',
      status: 'Unpaid',
      targetDate: new Date('01/04/2020').toString(),
    },
    {
      amount: 1,
      filesID: '1N',
      status: 'Paid',
      targetDate: new Date('01/05/2020').toString(),
    },
  ]

  return makeResponse(200, invoices)
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

  return makeResponse(200, region)
}
