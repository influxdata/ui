// Libraries
import {produce} from 'immer'
// Types
import {RemoteDataState} from 'src/types'
import {Account, BillingDate, LimitStatuses, History} from 'src/types/billing'

export interface UsageState {
  account: Account
  billingStart: BillingDate
  limitsStatus: LimitStatuses
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

export const setLimitsStatus = (limitsStatus: LimitStatuses) =>
  ({
    type: 'SET_LIMITS_STATUS',
    limitsStatus,
  } as const)

export const setLimitsStateStatus = (status: RemoteDataState) =>
  ({
    type: 'SET_LIMITS_STATE_STATUS',
    status,
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
  | ReturnType<typeof setLimitsStatus>
  | ReturnType<typeof setLimitsStateStatus>
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
    zuoraAccountId: '',
  },
  billingStart: {
    date: '01/01/1970',
    time: '00:00',
    status: RemoteDataState.NotStarted,
  },
  limitsStatus: {
    read: {
      status: '',
    },
    write: {
      status: '',
    },
    cardinality: {
      status: '',
    },
    status: RemoteDataState.NotStarted,
  },
  history: {
    status: RemoteDataState.NotStarted,
    rateLimits: '',
    billingStats: '',
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
      case 'SET_LIMITS_STATUS': {
        draftState.limitsStatus = action.limitsStatus

        return
      }
      case 'SET_LIMITS_STATE_STATUS': {
        if (!draftState.limitsStatus?.status) {
          draftState.limitsStatus = {
            ...draftState.limitsStatus,
            status: action.status,
          }

          return
        }

        draftState.limitsStatus.status = action.status
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
