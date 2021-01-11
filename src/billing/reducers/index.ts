// Libraries
import produce from 'immer'
import {RemoteDataState} from 'src/types'

// Types
import {
  Account,
  BillingNotifySettings,
  Invoices,
  LimitStatus,
  OrgLimits,
  PaymentMethods,
  Region,
} from 'src/types/billing'

export interface BillingState {
  account: Account
  billingSettings: BillingNotifySettings
  invoices: Invoices
  invoicesStatus: RemoteDataState
  limitsStatus: LimitStatus
  orgLimits: OrgLimits
  paymentMethods: PaymentMethods
  region: Region
}

export const initialState = (): BillingState => ({
  account: {
    status: RemoteDataState.NotStarted,
  },
  billingSettings: {
    balanceThreshold: 0,
    isNotify: false,
    notifyEmail: '',
    status: RemoteDataState.NotStarted,
  },
  invoices: null,
  invoicesStatus: RemoteDataState.NotStarted,
  limitsStatus: {
    status: RemoteDataState.NotStarted,
  },
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

export const setBillingSettings = (billingSettings: BillingNotifySettings) =>
  ({
    type: 'SET_BILLING_SETTINGS',
    billingSettings,
  } as const)

export const setBillingSettingsStatus = (status: RemoteDataState) =>
  ({
    type: 'SET_BILLING_SETTINGS_STATUS',
    status,
  } as const)

export const setInvoices = (invoices: Invoices, status: RemoteDataState) =>
  ({
    type: 'SET_INVOICES',
    invoices,
    invoiceStatus: status,
  } as const)

export const setInvoicesStatus = (status: RemoteDataState) =>
  ({
    type: 'SET_INVOICES_STATUS',
    invoiceStatus: status,
  } as const)

export const setLimitsStatus = (limitsStatus: OrgLimits) =>
  ({
    type: 'SET_LIMITS_STATUS',
    limitsStatus,
  } as const)

export const setLimitsStateStatus = (status: RemoteDataState) =>
  ({
    type: 'SET_LIMITS_STATE_STATUS',
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

export const setRegion = (region: Region) =>
  ({
    type: 'SET_REGION',
    region,
  } as const)

export const setRegionStatus = (status: RemoteDataState) =>
  ({
    type: 'SET_REGION_STATUS',
    status,
  } as const)

export type Action =
  | ReturnType<typeof setAll>
  | ReturnType<typeof setAccount>
  | ReturnType<typeof setAccountStatus>
  | ReturnType<typeof setBillingSettings>
  | ReturnType<typeof setBillingSettingsStatus>
  | ReturnType<typeof setInvoices>
  | ReturnType<typeof setInvoicesStatus>
  | ReturnType<typeof setLimitsStatus>
  | ReturnType<typeof setLimitsStateStatus>
  | ReturnType<typeof setOrgLimits>
  | ReturnType<typeof setOrgLimitStatus>
  | ReturnType<typeof setRegion>
  | ReturnType<typeof setRegionStatus>

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
      case 'SET_BILLING_SETTINGS': {
        draftState.billingSettings = action.billingSettings

        return
      }
      case 'SET_BILLING_SETTINGS_STATUS': {
        if (!draftState.billingSettings?.status) {
          draftState.billingSettings = {
            ...draftState.billingSettings,
            status: action.status,
          }

          return
        }

        draftState.billingSettings.status = action.status
        return
      }
      case 'SET_INVOICES': {
        draftState.invoices = action.invoices
        draftState.invoicesStatus = action.invoiceStatus

        return
      }
      case 'SET_INVOICES_STATUS': {
        draftState.invoicesStatus = action.invoiceStatus

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
      case 'SET_REGION': {
        draftState.region = action.region

        return
      }
      case 'SET_REGION_STATUS': {
        if (!draftState.region?.status) {
          draftState.region = {
            ...draftState.region,
            status: action.status,
          }

          return
        }

        draftState.region.status = action.status
        return
      }
    }
  })
