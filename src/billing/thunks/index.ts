import {Dispatch} from 'react'

// Reducer
import {
  Action,
  setBillingInfo,
  setBillingInfoStatus,
  setBillingSettings,
  setBillingSettingsStatus,
  setInvoices,
  setInvoicesStatus,
  setMarketplace,
  setMarketplaceStatus,
  setOrgLimits,
  setOrgLimitsStatus,
} from 'src/billing/reducers'

// API
import {
  getMarketplace as apiGetMarketplace,
  getBillingInfo as apiGetBillingInfo,
  getBillingNotificationSettings,
  updateBillingNotificationSettings,
  getInvoices as apiGetInvoices,
  getOrgsLimits as apiGetOrgLimits,
} from 'src/billing/api'

// Types
import {RemoteDataState} from 'src/types'
import {BillingNotifySettings, Invoice} from 'src/types/billing'

// TODO(ariel): add error handling here
// notify() will not work since Dispatch here is based on the passed in dispatch from the local reducer
// and not from the higher level dispatch from the app.
export const getMarketplace = async (dispatch: Dispatch<Action>) => {
  try {
    dispatch(setMarketplaceStatus(RemoteDataState.Loading))
    const resp = await apiGetMarketplace()

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    dispatch(
      setMarketplace({...resp.data, loadingStatus: RemoteDataState.Done})
    )
  } catch (error) {
    console.error(error)

    dispatch(setMarketplaceStatus(RemoteDataState.Error))
  }
}

export const getOrgLimits = async (dispatch: Dispatch<Action>) => {
  try {
    dispatch(setOrgLimitsStatus(RemoteDataState.Loading))
    const resp = await apiGetOrgLimits()

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    dispatch(setOrgLimits({...resp.data, status: RemoteDataState.Done}))
  } catch (error) {
    console.error(error)

    dispatch(setOrgLimitsStatus(RemoteDataState.Error))
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

export const updateBillingSettings = async (
  dispatch: Dispatch<Action>,
  settings: BillingNotifySettings
) => {
  try {
    dispatch(setBillingSettingsStatus(RemoteDataState.Loading))
    const resp = await updateBillingNotificationSettings(settings)

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
