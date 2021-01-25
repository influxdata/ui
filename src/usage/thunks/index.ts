// Libraries
import {Dispatch} from 'react'

// API
import {
  getBillingAccount,
  getBillingDate as apiGetBillingDate,
  getHistory as apiGetHistory,
} from 'src/usage/api'

// Actions
import {
  setAccount,
  setAccountStatus,
  setBillingDate,
  setBillingDateStatus,
  setHistory,
  setHistoryStatus,
  Action,
} from 'src/usage/reducers'

// Types
import {RemoteDataState} from 'src/types'

export const getBillingDate = async (dispatch: Dispatch<Action>) => {
  try {
    dispatch(setBillingDateStatus(RemoteDataState.Loading))
    const resp = await apiGetBillingDate()

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }
    dispatch(setBillingDate({...resp.data, status: RemoteDataState.Done}))
  } catch (error) {
    dispatch(setBillingDateStatus(RemoteDataState.Error))
    console.error(error)
  }
}

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

export const getHistory = async (dispatch: Dispatch<Action>) => {
  try {
    dispatch(setHistoryStatus(RemoteDataState.Loading))
    const resp = await apiGetHistory()

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }
    dispatch(setHistory({...resp.data, status: RemoteDataState.Done}))
  } catch (error) {
    console.error(error)

    dispatch(setHistoryStatus(RemoteDataState.Error))
  }
}
