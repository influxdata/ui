// Libraries
import produce from 'immer'
import {RemoteDataState} from 'src/types'

// Types
import {
  Account,
  BillingNotifySettings,
  CreditCardParams,
  Invoice,
  PaymentMethod,
  Region,
} from 'src/types/billing'

export interface BillingState {
  account: Account
  billingSettings: BillingNotifySettings
  creditCards: CreditCardParams
  invoices: Invoice[]
  invoicesStatus: RemoteDataState
  paymentMethods: PaymentMethod[]
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
    pricingVersion: null,
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
  paymentMethodsStatus: RemoteDataState.NotStarted,
  paymentMethods: null,
  region: null,
})

export type BillingReducer = React.Reducer<BillingState, Action>

// TODO(ariel): consolidate this with the account in usage
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
