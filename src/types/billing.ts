// can we just get this from IDPE
// directly or does Quartz have special
// permissions / knowledge?
import {
  Account as GenAccount,
  BillingNotifySettings as GenBillingNotifySettings,
  Invoice as GenInvoice,
  PaymentMethod as GenPaymentMethod,
  Region as GenRegion,
  BillingContact,
  History as GenHistory,
  CreditCardParams as GenCreditCardParams,
  BillingDate as GenBillingDate,
} from 'src/client/unityRoutes'
import {RemoteDataState} from 'src/types'

export interface CreditCardParams extends GenCreditCardParams {}
export interface Region extends GenRegion {
  status: RemoteDataState
}

export interface History extends GenHistory {
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

export interface BillingDate extends GenBillingDate {
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
