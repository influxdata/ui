// can we just get this from IDPE
// directly or does Quartz have special
// permissions / knowledge?
import {
  Account as GenAccount,
  BillingNotifySettings as GenBillingNotifySettings,
  Invoice as GenInvoice,
  PaymentMethod as GenPaymentMethod,
} from 'src/client/unityRoutes'
import {RemoteDataState} from 'src/types'

export interface Region {
  title: string
  isBeta: boolean
  isAvailable: boolean
  provider: string
  region: string
  status: RemoteDataState
}

interface BillingContact {
  companyName: string
  email: string
  firstName: string
  lastName: string
  country: string
  street1: string
  street2: string
  city: string
  subdivision: string
  postalCode: number
}

export interface CreditCardParams {
  id: string
  tenantID: string
  key: string
  signature: string
  token: string
  style: string
  submitEnabled: 'true' | 'false' // Zuora wants the literal string true or false
  url: string
}

export interface MarketplaceSubscription {
  marketplace: string
  subscriberId: string
  status: string
}

export interface History {
  billingStats: string
  rateLimits: string
  usageStats: string
  status: RemoteDataState
}
export interface Account extends GenAccount {
  status: RemoteDataState
}

export interface PaymentMethod extends GenPaymentMethod {}

export type PaymentMethods = PaymentMethod[]

export interface Invoice extends GenInvoice {}

export type Invoices = Invoice[]

// Current FreePage Props
export interface Props {
  isRegionBeta: boolean
}

export interface BillingNotifySettings extends GenBillingNotifySettings {
  status: RemoteDataState
}

export interface BillingDate {
  date: Date | string
  time: Date | string
  status: RemoteDataState
}

// Current PayAsYouGo Props
export interface Props {
  account: Account // could we possibly combine Account with BillingContact?
  billingNotifySettings: BillingNotifySettings // separate endpoint w/ put [x]
  ccPageParams: CreditCardParams // separate endpoint [X]
  contact: BillingContact // separate endpoint (get, put)
  email: string // where does this come from?
  history: History
  invoices: Invoices // separate endpoint [X]
  paymentMethods: PaymentMethods // separate endpoint [X]
  region: Region
}

export interface ZuoraResponse {
  success: boolean
  responseFrom: string
  refId: string
}
