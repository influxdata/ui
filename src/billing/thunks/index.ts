import {Dispatch} from 'react'

// Reducer
import {
  Action,
  setAccount,
  setAccountStatus,
  setBillingSettings,
  setBillingSettingsStatus,
  setInvoices,
  setInvoicesStatus,
  setLimitsStatus,
  setLimitsStateStatus,
  setPaymentMethods,
  setPaymentMethodsStatus,
  setRegion,
  setRegionStatus,
} from 'src/billing/reducers'

// API
import {
  getBillingAccount,
  getBillingCreditCard,
  getBillingNotificationSettings,
  getPaymentMethods as apiGetPaymentMethods,
  getLimitsStatus as apiGetLimitsStatus,
  getInvoices as apiGetInvoices,
  getRegion as apiGetRegion,
} from 'src/billing/api'

// Types
import {RemoteDataState} from 'src/types'
import {CreditCardParams, PaymentMethods} from 'src/types/billing'

export const getAccount = async (dispatch: Dispatch<Action>) => {
  try {
    dispatch(setAccountStatus(RemoteDataState.Loading))
    const resp = await getBillingAccount()

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    dispatch(setAccount({...resp.data, status: RemoteDataState.Done}))
  } catch (error) {
    console.error(error)

    dispatch(setAccountStatus(RemoteDataState.Error))
  }
}

export const getBillingSettings = async (dispatch: Dispatch<Action>) => {
  try {
    dispatch(setBillingSettingsStatus(RemoteDataState.Loading))
    const resp = await getBillingNotificationSettings()

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    dispatch(setBillingSettings({...resp.data, status: RemoteDataState.Done}))
  } catch (error) {
    console.error(error)

    dispatch(setBillingSettingsStatus(RemoteDataState.Error))
  }
}

export const getInvoices = async (dispatch: Dispatch<Action>) => {
  try {
    dispatch(setInvoicesStatus(RemoteDataState.Loading))
    const resp = await apiGetInvoices()

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    dispatch(setInvoices(resp.data, RemoteDataState.Done))
  } catch (error) {
    console.error(error)

    dispatch(setInvoicesStatus(RemoteDataState.Error))
  }
}

export const getLimitsStatus = async (dispatch: Dispatch<Action>) => {
  try {
    dispatch(setLimitsStateStatus(RemoteDataState.Loading))
    const resp = await apiGetLimitsStatus()

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    dispatch(setLimitsStatus({...resp.data, status: RemoteDataState.Done}))
  } catch (error) {
    console.error(error)

    dispatch(setLimitsStateStatus(RemoteDataState.Error))
  }
}

export const getPaymentMethods = async (dispatch: Dispatch<Action>) => {
  try {
    dispatch(setPaymentMethodsStatus(RemoteDataState.Loading))

    const [paymentMethodsResp, ccResp] = await Promise.all([
      apiGetPaymentMethods(),
      getBillingCreditCard(),
    ])

    if (paymentMethodsResp.status !== 200) {
      throw new Error(paymentMethodsResp.data.message)
    }

    if (ccResp.status !== 200) {
      throw new Error(ccResp.data.message)
    }

    dispatch(
      setPaymentMethods(
        paymentMethodsResp.data as PaymentMethods,
        ccResp.data as CreditCardParams,
        RemoteDataState.Done
      )
    )
  } catch (error) {
    console.error(error)

    dispatch(setPaymentMethodsStatus(RemoteDataState.Error))
  }
}

export const getRegion = async (dispatch: Dispatch<Action>) => {
  try {
    dispatch(setRegionStatus(RemoteDataState.Loading))
    const resp = await apiGetRegion()

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    dispatch(setRegion({...resp.data, status: RemoteDataState.Done}))
  } catch (error) {
    console.error(error)

    dispatch(setRegionStatus(RemoteDataState.Error))
  }
}
