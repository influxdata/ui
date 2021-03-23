// Libraries
import produce from 'immer'
import {RemoteDataState} from 'src/types'

// Types
import {
  Account,
  BillingInfo,
  BillingNotifySettings,
  CreditCardParams,
  Invoice,
} from 'src/types/billing'

export interface BillingState {
  account: Account
  billingInfo: BillingInfo
  billingSettings: BillingNotifySettings
  creditCard: CreditCardParams
  invoices: Invoice[]
  invoicesStatus: RemoteDataState
}

export const initialState = (): BillingState => ({
  account: {
    status: RemoteDataState.NotStarted,
    id: null,
    marketplace: '',
    type: 'free',
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
  creditCard: null,
  invoices: null,
  invoicesStatus: RemoteDataState.NotStarted,
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
  | ReturnType<typeof setInvoices>
  | ReturnType<typeof setInvoicesStatus>
  | ReturnType<typeof setCreditCard>
  | ReturnType<typeof setCreditCardStatus>

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
    }
  })
