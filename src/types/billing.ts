// can we just get this from IDPE
// directly or does Quartz have special
// permissions / knowledge?
import {
  Account as GenAccount,
  BillingNotifySettings as GenBillingNotifySettings,
  Invoice as GenInvoice,
  PaymentMethod as GenPaymentMethod,
} from 'src/client/unityRoutes'
import {
  RemoteDataState,
  Limits,
  LimitsStatus as GenLimitsStatus,
} from 'src/types'

export interface OrgLimits extends Limits {
  status: RemoteDataState
}

export interface LimitStatus extends GenLimitsStatus {
  status: RemoteDataState
}

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
  orgLimits: OrgLimits
}

export interface BillingNotifySettings extends GenBillingNotifySettings {
  status: RemoteDataState
}

// Current PayAsYouGo Props
export interface Props {
  account: Account // could we possibly combine Account with BillingContact?
  billingNotifySettings: BillingNotifySettings // separate endpoint w/ put [x]
  ccPageParams: CreditCardParams // separate endpoint [X]
  contact: BillingContact // separate endpoint (get, put)
  email: string // where does this come from?
  invoices: Invoices // separate endpoint [X]
  limitStatuses: LimitStatus // get from IDPE
  paymentMethods: PaymentMethods // separate endpoint [X]
  orgLimits: OrgLimits // get from IDPE
  region: Region
}

export interface ZuoraResponse {
  success: boolean
  responseFrom: string
  refId: string
}
