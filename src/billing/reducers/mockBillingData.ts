import {RemoteDataState} from 'src/types'
import {
  Account,
  BillingInfo,
  BillingNotifySettings,
  Invoice,
  PaymentMethod,
  Region,
  ZuoraParams,
} from 'src/types/billing'

export const mockAccount: Account = {
  status: RemoteDataState.Done,
  id: 'account_1',
  marketplace: 'us-west',
  type: 'free',
}

export const mockBillingInfo: BillingInfo = {
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
    city: 'Brooklyn',
    street1: '123 Powers St',
    subdivision: 'NY',
    postalCode: 30000,
  },
  status: RemoteDataState.Done,
}

export const mockBillingSettings: BillingNotifySettings = {
  balanceThreshold: 100,
  isNotify: true,
  notifyEmail: 'ariel@influxdata.com',
  status: RemoteDataState.Done,
}

export const mockInvoices: Invoice[] = [
  {
    status: 'unpaid',
    amount: 100,
    targetDate: '02/01/2021',
    filesId: 'abc123',
  },
  {
    status: 'paid',
    amount: 0,
    targetDate: '01/01/2021',
    filesId: 'xyz123',
  },
]

export const mockPaymentMethods: PaymentMethod[] = [
  {
    cardType: 'visa',
    cardNumber: '4242424242424242',
    expirationMonth: '02',
    expirationYear: '2024',
    defaultPaymentMethod: true,
  },
  {
    cardType: 'mastercard',
    cardNumber: '5242424242424242',
    expirationMonth: '03',
    expirationYear: '2023',
    defaultPaymentMethod: false,
  },
]

export const mockRegion: Region = {
  title: 'EU Central',
  isBeta: false,
  isAvailable: true,
  provider: 'aws',
  region: 'eu-central',
  status: RemoteDataState.Done,
}

export const mockCreditCard: CreditCardParams = {
  id: 'cc-123',
  tenantId: 'david-1',
  key: 'value',
  signature: 'John Hancock',
  token: 'cha-ching',
  style: 'free',
  submitEnabled: 'false',
  url: 'www.influxdata.com',
  status: RemoteDataState.Done,
}
