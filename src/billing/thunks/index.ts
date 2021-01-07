import {Dispatch} from 'react'
import {
  Action,
  setAccount,
  setAccountStatus,
  setOrgLimits,
  setOrgLimitStatus,
} from 'src/billing/reducers'
import {getBillingAccount, getOrgRateLimits} from 'src/billing/api'
import {RemoteDataState} from 'src/types'

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

export const getOrgLimits = async (dispatch: Dispatch<Action>) => {
  try {
    dispatch(setOrgLimitStatus(RemoteDataState.Loading))
    const resp = await getOrgRateLimits()

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    dispatch(setOrgLimits({...resp.data, status: RemoteDataState.Done}))
  } catch (error) {
    console.error(error)

    dispatch(setOrgLimitStatus(RemoteDataState.Error))
  }
}
