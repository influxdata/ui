// Libraries
import produce from 'immer'
import {RemoteDataState} from 'src/types'

// Types
import {
  Account,
  BillingNotifySettings,
  Invoices,
  OrgLimits,
  PaymentMethods,
  Region,
} from 'src/types/billing'

export interface BillingState {
  account: Account
  billingSettings: BillingNotifySettings
  invoices: Invoices
  orgLimits: OrgLimits
  paymentMethods: PaymentMethods
  region: Region
}

export const initialState = (): BillingState => ({
  account: {
    status: RemoteDataState.NotStarted,
  },
  billingSettings: null,
  invoices: null,
  orgLimits: {
    status: RemoteDataState.NotStarted,
  },
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

export const setOrgLimits = (orgLimits: OrgLimits) =>
  ({
    type: 'SET_ORG_LIMITS',
    orgLimits,
  } as const)

export const setOrgLimitStatus = (status: RemoteDataState) =>
  ({
    type: 'SET_ORG_LIMITS_STATUS',
    status,
  } as const)

export type Action =
  | ReturnType<typeof setAll>
  | ReturnType<typeof setAccount>
  | ReturnType<typeof setAccountStatus>
  | ReturnType<typeof setOrgLimits>
  | ReturnType<typeof setOrgLimitStatus>

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
        if (!draftState.account?.status) {
          draftState.account = {...draftState.account, status: action.status}

          return
        }

        draftState.account.status = action.status
        return
      }
      case 'SET_ORG_LIMITS': {
        draftState.orgLimits = action.orgLimits

        return
      }
      case 'SET_ORG_LIMITS_STATUS': {
        if (!draftState.orgLimits?.status) {
          draftState.orgLimits = {
            ...draftState.orgLimits,
            status: action.status,
          }

          return
        }

        draftState.orgLimits.status = action.status
        return
      }
    }
  })
