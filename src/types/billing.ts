import {
  Account,
  CreditCardParams as GenCreditCardParams,
} from 'src/client/unityRoutes'
export {
  BillingContact,
  BillingInfo,
  BillingNotifySettings,
  CreditCardParams,
  Invoice,
  Invoices,
  Marketplace,
  PaymentMethod,
  UsageVectors,
  UsageVector,
} from 'src/client/unityRoutes'

export type BillingProvider = Account['billingProvider']

export interface ZuoraResponse {
  success: boolean
  responseFrom: string
  refId: string
}

export type ZuoraResponseHandler = (response: ZuoraResponse) => void

export interface ZuoraClient {
  render: (
    zuoraParams: GenCreditCardParams,
    formFields: {},
    onSubmit: ZuoraResponseHandler
  ) => void
  submit: () => void
}
