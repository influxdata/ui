import {
  Account as GenAccount,
  BillingDate as GenBillingDate,
  BillingInfo as GenBillingInfo,
  CreditCardParams as GenCreditCardParams,
} from 'src/client/unityRoutes'
export {BillingNotifySettings} from 'src/client/unityRoutes'

export {
  BillingContact,
  Invoice,
  Invoices,
  Marketplace,
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

export interface BillingDate extends GenBillingDate {
  status: RemoteDataState
}
export interface ZuoraResponse {
  success: boolean
  responseFrom: string
  refId: string
}
