import {RemoteDataState} from 'src/types'
import {
  BillingInfo,
  BillingNotifySettings,
  Invoice,
  CreditCardParams,
} from 'src/types/billing'

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
