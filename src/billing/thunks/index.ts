import {Dispatch} from 'react'

// Reducer
import {
  Action,
  setAccount,
  setAccountStatus,
  setBillingInfo,
  setBillingInfoStatus,
  setBillingSettings,
  setBillingSettingsStatus,
  setCreditCard,
  setCreditCardStatus,
  setInvoices,
  setInvoicesStatus,
} from 'src/billing/reducers'

// API
import {
  getAccount as apiGetAccount,
  getBillingInfo as apiGetBillingInfo,
  getBillingCreditCard,
  getCheckoutZuoraParams,
  getBillingNotificationSettings,
  getInvoices as apiGetInvoices,
} from 'src/billing/api'

// Types
import {RemoteDataState} from 'src/types'
import {CreditCardParams, Invoice} from 'src/types/billing'

export const getAccount = async (dispatch: Dispatch<Action>) => {
  try {
    dispatch(setAccountStatus(RemoteDataState.Loading))
    const resp = await apiGetAccount()

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    dispatch(setAccount({...resp.data, status: RemoteDataState.Done}))
  } catch (error) {
    console.error(error)

    dispatch(setAccountStatus(RemoteDataState.Error))
  }
}

export const getBillingInfo = async (dispatch: Dispatch<Action>) => {
  try {
    dispatch(setBillingInfoStatus(RemoteDataState.Loading))
    const resp = await apiGetBillingInfo()

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    dispatch(setBillingInfo({...resp.data, status: RemoteDataState.Done}))
  } catch (error) {
    console.error(error)

    dispatch(setBillingInfoStatus(RemoteDataState.Error))
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

    dispatch(setInvoices(resp.data as Invoice[], RemoteDataState.Done))
  } catch (error) {
    console.error(error)

    dispatch(setInvoicesStatus(RemoteDataState.Error))
  }
}

export const getCreditCard = async (dispatch: Dispatch<Action>) => {
  try {
    dispatch(setCreditCardStatus(RemoteDataState.Loading))

<<<<<<< HEAD
    const resp = await getBillingCreditCard()
=======
    const [paymentMethodsResp, ccResp] = await Promise.all([
      apiGetPaymentMethods(),
      getBillingCreditCard(),
      getCheckoutZuoraParams(),
    ])

    if (paymentMethodsResp.status !== 200) {
      throw new Error(paymentMethodsResp.data.message)
    }

    if (ccResp.status !== 200) {
      throw new Error(ccResp.data.message)
    }

    dispatch(
      setPaymentMethods(
        paymentMethodsResp.data as PaymentMethod[],
        ccResp.data,
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
>>>>>>> 15d13e815 (chore: add checkout and zuora forms submission)

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    dispatch(setCreditCard(resp.data as CreditCardParams))
  } catch (error) {
    console.error(error)

    dispatch(setCreditCardStatus(RemoteDataState.Error))
  }
}
