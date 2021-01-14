// Libraries
import {Dispatch} from 'react'

// API
import {
  getBillingAccount,
  getLimitsStatus as apiGetLimitsStatus,
  getBillingDate as apiGetBillingDate,
} from 'src/usage/api'

// Actions
import {
  setAccount,
  setAccountStatus,
  setBillingDate,
  setBillingDateStatus,
  setLimitsStatus,
  setLimitsStateStatus,
  Action,
} from 'src/usage/reducers'

// Types
import {RemoteDataState} from 'src/types'
// import // LimitStatus,
// 'src/types/billing'

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
