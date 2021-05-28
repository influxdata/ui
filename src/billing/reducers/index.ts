// Libraries
import produce from 'immer'
import {RemoteDataState} from 'src/types'

// Types
import {BillingInfo, PaymentMethod, CreditCardParams} from 'src/types/billing'

export interface BillingState {
  billingInfo: BillingInfo
  creditCard: CreditCardParams
  creditCards: CreditCardParams
}

export const initialState = (): BillingState => ({
  billingInfo: {
    balance: null,
    region: '',
    paymentMethod: null,
    balanceUpdatedAt: '',
    contact: null,
    status: RemoteDataState.NotStarted,
  },
  creditCards: null,
  creditCard: null,
})

export type BillingReducer = React.Reducer<BillingState, Action>

export const setBillingInfo = (billingInfo: BillingInfo) =>
  ({
    type: 'SET_BILLING_INFO',
    billingInfo,
  } as const)

export const setBillingInfoStatus = (status: RemoteDataState) =>
  ({
    type: 'SET_BILLING_INFO_STATUS',
    status,
  } as const)

export const setPaymentMethods = (
  paymentMethods: PaymentMethod[],
  creditCards: CreditCardParams,
  paymentMethodsStatus: RemoteDataState
) =>
  ({
    type: 'SET_PAYMENT_METHODS',
    paymentMethods,
    creditCards,
    paymentMethodsStatus,
  } as const)

export const setPaymentMethodsStatus = (
  paymentMethodsStatus: RemoteDataState
) =>
  ({
    type: 'SET_PAYMENT_METHODS_STATUS',
    paymentMethodsStatus,
  } as const)

export const setCreditCard = (creditCard: CreditCardParams) =>
  ({
    type: 'SET_CREDIT_CARD',
    creditCard,
  } as const)

export const setCreditCardStatus = (status: RemoteDataState) =>
  ({
    type: 'SET_CREDIT_CARD_STATUS',
    status,
  } as const)

export type Action =
  | ReturnType<typeof setBillingInfo>
  | ReturnType<typeof setBillingInfoStatus>
  | ReturnType<typeof setCreditCard>
  | ReturnType<typeof setCreditCardStatus>

export const billingReducer = (
  state: BillingState = initialState(),
  action: Action
): BillingState =>
  produce(state, draftState => {
    switch (action.type) {
      case 'SET_BILLING_INFO': {
        draftState.billingInfo = action.billingInfo

        return
      }
      case 'SET_BILLING_INFO_STATUS': {
        if (!draftState.billingInfo?.status) {
          draftState.billingInfo = {
            ...draftState.billingInfo,
            status: action.status,
          }

          return
        }

        draftState.billingInfo.status = action.status
        return
      }
      case 'SET_CREDIT_CARD': {
        draftState.creditCard = action.creditCard

        return
      }
      case 'SET_CREDIT_CARD_STATUS': {
        if (!draftState.creditCard?.status) {
          draftState.creditCard = {
            ...draftState.creditCard,
            status: action.status,
          }

          return
        }

        draftState.creditCard.status = action.status
        return
      }
    }
  })
