// Libraries
import produce from 'immer'
import {RemoteDataState} from 'src/types'

// Types
import {
  Account,
  BillingNotifySettings,
  Invoices,
  OrgLimit,
  PaymentMethods,
  Region,
} from 'src/types/billing'

export interface BillingState {
  account: Account
  billingSettings: BillingNotifySettings
  invoices: Invoices
  orgLimits: OrgLimit
  paymentMethods: PaymentMethods
  region: Region
}

export const initialState = (): BillingState => ({
  account: null,
  billingSettings: null,
  invoices: null,
  orgLimits: null,
  paymentMethods: null,
  region: null,
})

export type BillingReducer = React.Reducer<BillingState, Action>

export const setAll = (billing: BillingState) =>
  ({
    type: 'SET_ALL',
    billing,
  } as const)

export const setAccount = (account: Account) =>
  ({
    type: 'SET_ACCOUNT',
    account,
  } as const)

export const setAccountStatus = (status: RemoteDataState) =>
  ({
    type: 'SET_ACCOUNT_STATUS',
    status,
  } as const)

export type Action =
  | ReturnType<typeof setAll>
  | ReturnType<typeof setAccount>
  | ReturnType<typeof setAccountStatus>

export const billingReducer = (
  state: BillingState = initialState(),
  action: Action
): BillingState =>
  produce(state, draftState => {
    switch (action.type) {
      case 'SET_ACCOUNT': {
        draftState.account = action.account

        return
      }
      case 'SET_ACCOUNT_STATUS': {
        draftState.account.status = action.status

        return
      }
    }
  })
