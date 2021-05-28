// Libraries
import produce from 'immer'
import {RemoteDataState} from 'src/types'

// Types
import {PaymentMethod, CreditCardParams} from 'src/types/billing'

export interface BillingState {
  creditCard: CreditCardParams
  creditCards: CreditCardParams
}

export const initialState = (): BillingState => ({
  creditCards: null,
  creditCard: null,
})

export type BillingReducer = React.Reducer<BillingState, Action>

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
  | ReturnType<typeof setCreditCard>
  | ReturnType<typeof setCreditCardStatus>

export const billingReducer = (
  state: BillingState = initialState(),
  action: Action
): BillingState =>
  produce(state, draftState => {
    switch (action.type) {
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
