import {
  Account as GenAccount,
  BillingNotifySettings as GenBillingNotifySettings,
  BillingDate as GenBillingDate,
  BillingInfo as GenBillingInfo,
  CreditCardParams as GenCreditCardParams,
} from 'src/client/unityRoutes'

export {
  BillingContact,
  Invoice,
  Invoices,
  PaymentMethod,
  UsageVectors,
  UsageVector,
} from 'src/client/unityRoutes'
import {RemoteDataState} from 'src/types'

export type ZuoraResponseHandler = (response: ZuoraResponse) => void

export interface ZuoraClient {
  render: (
    zuoraParams: GenCreditCardParams,
    formFields: {},
    onSubmit: ZuoraResponseHandler
  ) => void
  submit: () => void
}

export interface BillingInfo extends GenBillingInfo {
  status: RemoteDataState
}

export interface CreditCardParams extends GenCreditCardParams {
  status: RemoteDataState
}

export interface Account extends GenAccount {
  status: RemoteDataState
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
  email: string // where does this come from?
  history: History
}

export interface ZuoraResponse {
  success: boolean
  responseFrom: string
  refId: string
}
