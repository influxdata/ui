import {
  getBillingAccount as getBillingAccountGenerated,
  getBillingNotifySettings,
  getBillingPaymentMethods,
  getBillingCc,
  getInvoices as getInvoicesGenerated,
  getBillingRegion,
  Account,
} from 'src/client/unityRoutes'

import {RemoteDataState} from 'src/types'
import {
  Invoice,
  CreditCardParams,
  Region,
  BillingNotifySettings,
  PaymentMethod,
} from 'src/types/billing'

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
    pricingVersion: 4,
    type: 'free',
    updatedAt: new Date().toString(),
    users: [{}],
    zuoraAccountId: 'zID123',
  }
  return makeResponse(200, account)
}

export const getPaymentMethods = (): ReturnType<typeof getBillingPaymentMethods> => {
  const paymentMethods: PaymentMethod[] = [
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

export const getInvoices = (): ReturnType<typeof getInvoicesGenerated> => {
  const invoices: Invoice[] = [
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

export const getRegion = (): ReturnType<typeof getBillingRegion> => {
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
