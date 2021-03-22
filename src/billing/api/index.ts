import {
  getAccount as apiGetAccount,
  getBilling,
  getSettingsNotifications,
  getPaymentForm,
  getBillingInvoices,
} from 'src/client/unityRoutes'

import {RemoteDataState} from 'src/types'
import {
  Account,
  Invoice,
  CreditCardParams,
  BillingNotifySettings,
  BillingInfo,
} from 'src/types/billing'

const makeResponse = (status, data) => {
  return Promise.resolve({
    status,
    headers: new Headers({'Content-Type': 'application/json'}),
    data,
  })
}

export const getAccount = (): ReturnType<typeof apiGetAccount> => {
  const account: Account = {
    id: 'account_1',
    marketplace: 'AWS',
    type: 'free',
    status: RemoteDataState.Done,
  }
  return makeResponse(200, account)
}

export const getBillingInfo = (): ReturnType<typeof getBilling> => {
  const billing: BillingInfo = {
    balance: 100,
    region: 'us-west',
    paymentMethod: {
      cardType: 'Visa',
      cardNumber: '4242424242424242',
      expirationMonth: '04',
      expirationYear: '22',
      defaultPaymentMethod: true,
    },
    balanceUpdatedAt: new Date().toString(),
    contact: {
      companyName: 'InfluxDB',
      email: 'info@influxdata.com',
      firstName: 'Boatie',
      lastName: 'McBoatface',
      country: 'USA',
      street1: '123 Powers St',
      city: 'Brooklyn',
      subdivision: 'NY',
      postalCode: 30000,
    },
    status: RemoteDataState.Done,
  }
  return makeResponse(200, billing)
}

export const getBillingCreditCard = (): ReturnType<typeof getPaymentForm> => {
  const cc: CreditCardParams = {
    id: 'id123',
    tenantId: 'tenant123',
    key: 'key123',
    signature: 'John Hancock',
    token: 't0k3n',
    style: 'fresh',
    submitEnabled: 'true',
    url: 'you-are-el',
    status: RemoteDataState.Done,
  }
  return makeResponse(200, cc)
}

export const getBillingNotificationSettings = (): ReturnType<typeof getSettingsNotifications> => {
  const billingNotifySettings: BillingNotifySettings = {
    isNotify: true,
    balanceThreshold: 1000000,
    notifyEmail: 'asalem@influxdata.com',
    status: RemoteDataState.Done,
  }
  return makeResponse(200, billingNotifySettings)
}

export const getInvoices = (): ReturnType<typeof getBillingInvoices> => {
  const invoices: Invoice[] = [
    {
      amount: 0,
      filesId: 'abc123',
      status: 'Paid',
      targetDate: new Date('01/01/2020').toString(),
    },
    {
      amount: 10,
      filesId: '10E->405N',
      status: 'Unpaid',
      targetDate: new Date('01/02/2020').toString(),
    },
    {
      amount: 405,
      filesId: '405N->101N',
      status: 'Paid',
      targetDate: new Date('01/03/2020').toString(),
    },
    {
      amount: 101,
      filesId: '101N->1N',
      status: 'Unpaid',
      targetDate: new Date('01/04/2020').toString(),
    },
    {
      amount: 1,
      filesId: '1N',
      status: 'Paid',
      targetDate: new Date('01/05/2020').toString(),
    },
  ]

  return makeResponse(200, invoices)
}
