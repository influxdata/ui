import {RemoteDataState} from 'src/types'
import {
  Account,
  BillingNotifySettings,
  CreditCardParams,
  Invoice,
  PaymentMethod,
  Region,
} from 'src/types/billing'

export const mockAccount: Account = {
  status: RemoteDataState.Done,
  id: 100,
  balance: 100,
  billingContact: {},
  deletable: false,
  marketplaceSubscription: {},
  type: 'free',
  updatedAt: '01/01/2021',
  users: [],
  pricingVersion: 4,
  zuoraAccountId: 'z-id-me',
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
    filesID: 'abc123',
  },
  {
    status: 'paid',
    amount: 0,
    targetDate: '01/01/2021',
    filesID: 'xyz123',
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
  tenantID: 'david-1',
  key: 'value',
  signature: 'John Hancock',
  token: 'cha-ching',
  style: 'free',
  submitEnabled: 'false',
  url: 'www.influxdata.com',
}
