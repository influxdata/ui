// Libraries
import produce from 'immer'
import {RemoteDataState} from 'src/types'

// Types
import {
  Account,
  BillingInfo,
  BillingNotifySettings,
  Invoice,
  PaymentMethod,
  CreditCardParams,
  OrgLimits,
} from 'src/types/billing'

export interface BillingState {
  account: Account
  billingInfo: BillingInfo
  billingSettings: BillingNotifySettings
  creditCard: CreditCardParams
  creditCards: CreditCardParams
  invoices: Invoice[]
  invoicesStatus: RemoteDataState
  orgLimits: OrgLimits
}

export const initialState = (): BillingState => ({
  account: {
    status: RemoteDataState.NotStarted,
    id: null,
    marketplace: null,
    type: 'free',
    balance: null,
    users: [],
    billingContact: null,
  },
  billingInfo: {
    balance: null,
    region: '',
    paymentMethod: null,
    balanceUpdatedAt: '',
    contact: null,
    status: RemoteDataState.NotStarted,
  },
  billingSettings: {
    balanceThreshold: 0,
    isNotify: false,
    notifyEmail: '',
    status: RemoteDataState.NotStarted,
  },
  creditCards: null,
  creditCard: null,
  invoices: null,
  invoicesStatus: RemoteDataState.NotStarted,
  orgLimits: null,
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

export const setOrgLimits = (orgLimits: OrgLimits) =>
  ({
    type: 'SET_ORG_LIMITS',
    orgLimits,
  } as const)

export const setOrgLimitsStatus = (status: RemoteDataState) =>
  ({
    type: 'SET_ORG_LIMITS_STATUS',
    status,
  } as const)

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

export const setInvoices = (invoices: Invoice[], status: RemoteDataState) =>
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
  | ReturnType<typeof setAccount>
  | ReturnType<typeof setAccountStatus>
  | ReturnType<typeof setBillingSettings>
  | ReturnType<typeof setBillingSettingsStatus>
  | ReturnType<typeof setBillingInfo>
  | ReturnType<typeof setBillingInfoStatus>
  | ReturnType<typeof setCreditCard>
  | ReturnType<typeof setCreditCardStatus>
  | ReturnType<typeof setInvoices>
  | ReturnType<typeof setInvoicesStatus>
  | ReturnType<typeof setOrgLimits>
  | ReturnType<typeof setOrgLimitsStatus>

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
