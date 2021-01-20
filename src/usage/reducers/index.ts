// Libraries
import {produce} from 'immer'
// Types
import {RemoteDataState} from 'src/types'
import {Account, BillingDate, History} from 'src/types/billing'

export interface UsageState {
  account: Account
  billingStart: BillingDate
  history: History
}

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

export const setBillingDateStatus = (status: RemoteDataState) =>
  ({
    type: 'SET_BILLING_DATE_STATUS',
    status,
  } as const)

export const setBillingDate = (billingStart: BillingDate) =>
  ({
    type: 'SET_BILLING_DATE',
    billingStart,
  } as const)

export const setHistoryStatus = (status: RemoteDataState) =>
  ({
    type: 'SET_HISTORY_STATUS',
    status,
  } as const)

export const setHistory = (history: History) =>
  ({
    type: 'SET_HISTORY',
    history,
  } as const)

export type Action =
  | ReturnType<typeof setAccount>
  | ReturnType<typeof setAccountStatus>
  | ReturnType<typeof setBillingDate>
  | ReturnType<typeof setBillingDateStatus>
  | ReturnType<typeof setHistoryStatus>
  | ReturnType<typeof setHistory>

export const initialState = (): UsageState => ({
  account: {
    status: RemoteDataState.NotStarted,
    id: null,
    balance: null,
    billingContact: null,
    deletable: false,
    marketplaceSubscription: null,
    type: 'free',
    updatedAt: '',
    users: [],
    pricingVersion: null,
    zuoraAccountId: '',
  },
  billingStart: {
    date: '',
    time: '',
    status: RemoteDataState.NotStarted,
  },
  history: {
    status: RemoteDataState.NotStarted,
    rateLimits: '',
    billingStats: '',
    usageStats: '',
  },
})

export type UsageReducer = React.Reducer<UsageState, Action>

export const usageReducer = (
  state: UsageState = initialState(),
  action: Action
): UsageState =>
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
      case 'SET_BILLING_DATE': {
        draftState.billingStart = action.billingStart

        return
      }
      case 'SET_BILLING_DATE_STATUS': {
        if (!draftState.billingStart?.status) {
          draftState.billingStart = {
            ...draftState.billingStart,
            status: action.status,
          }

          return
        }

        draftState.billingStart.status = action.status
        return
      }
      case 'SET_HISTORY': {
        draftState.history = action.history
        return
      }
      case 'SET_HISTORY_STATUS': {
        if (!draftState.history?.status) {
          draftState.history = {...draftState.history, status: action.status}
          return
        }
        draftState.history.status = action.status
        return
      }
    }
  })
