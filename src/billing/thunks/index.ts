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
  setInvoices,
  setInvoicesStatus,
  setOrgLimits,
  setOrgLimitsStatus,
} from 'src/billing/reducers'

// API
import {
  getAccount as apiGetAccount,
  getBillingInfo as apiGetBillingInfo,
  getBillingNotificationSettings,
  updateBillingNotificationSettings,
  getInvoices as apiGetInvoices,
  getOrgsLimits as apiGetOrgLimits,
} from 'src/billing/api'
import {notify} from 'src/shared/actions/notifications'

// Notifications
import {getErrorMessage} from 'src/utils/api'
import {getAccountFailed} from 'src/shared/copy/notification'

// Types
import {RemoteDataState} from 'src/types'
import {BillingNotifySettings, Invoice} from 'src/types/billing'

// TODO(ariel): add error handling here
export const getAccount = async (dispatch: Dispatch<Action>) => {
  try {
    dispatch(setAccountStatus(RemoteDataState.Loading))
    const resp = await apiGetAccount()

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    dispatch(notify('here is a notification'))
    dispatch(setAccount({...resp.data, status: RemoteDataState.Done}))
  } catch (error) {
    console.error(error)
    // const message = getErrorMessage(error)
    // dispatch(notify(getAccountFailed()))
    // dispatch(notify(getAccountFailed(message)))
    dispatch(setAccountStatus(RemoteDataState.Error))
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
