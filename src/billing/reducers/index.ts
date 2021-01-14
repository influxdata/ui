// Libraries
import produce from 'immer'
import {RemoteDataState} from 'src/types'

// Types
import {
  Account,
  BillingNotifySettings,
  CreditCardParams,
  Invoices,
  LimitStatus,
  OrgLimits,
  PaymentMethods,
  Region,
} from 'src/types/billing'

export interface BillingState {
  account: Account
  billingSettings: BillingNotifySettings
  creditCards: CreditCardParams
  invoices: Invoices
  invoicesStatus: RemoteDataState
  limitsStatus: LimitStatus
  orgLimits: OrgLimits
  paymentMethods: PaymentMethods
  paymentMethodsStatus: RemoteDataState
  region: Region
}

export const initialState = (): BillingState => ({
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
  billingSettings: {
    balanceThreshold: 0,
    isNotify: false,
    notifyEmail: '',
    status: RemoteDataState.NotStarted,
  },
  creditCards: null,
  invoices: null,
  invoicesStatus: RemoteDataState.NotStarted,
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
  orgLimits: {
    rate: {
      readKBs: null,
      concurrentReadRequests: null,
      writeKBs: null,
      concurrentWriteRequests: null,
      cardinality: null,
    },
    check: {
      maxChecks: null,
    },
    notificationRule: {
      maxNotifications: null,
      blockedNotificationRules: '',
    },
    notificationEndpoint: {
      blockedNotificationEndpoints: '',
    },
    bucket: {
      maxBuckets: null,
      maxRetentionDuration: null, // nanoseconds
    },
    task: {
      maxTasks: null,
    },
    dashboard: {
      maxDashboards: null,
    },
    status: RemoteDataState.NotStarted,
  },
  paymentMethodsStatus: RemoteDataState.NotStarted,
  paymentMethods: null,
  region: null,
})

export type BillingReducer = React.Reducer<BillingState, Action>

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

export const setLimitsStatus = (limitsStatus: LimitStatus) =>
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

export const setPaymentMethods = (
  paymentMethods: PaymentMethods,
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
  | ReturnType<typeof setPaymentMethods>
  | ReturnType<typeof setPaymentMethodsStatus>
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
      case 'SET_PAYMENT_METHODS': {
        draftState.paymentMethods = action.paymentMethods
        draftState.creditCards = action.creditCards
        draftState.paymentMethodsStatus = action.paymentMethodsStatus

        return
      }
      case 'SET_PAYMENT_METHODS_STATUS': {
        draftState.paymentMethodsStatus = action.paymentMethodsStatus

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
