import {Dispatch} from 'react'
import {
  Action,
  setAccount,
  setAccountStatus,
  setAll,
} from 'src/billing/reducers'
import {getBillingAccount} from 'src/billing/api'
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

export const getBilling = async (dispatch: Dispatch<Action>) => {
  try {
    // const [userResp, inviteResp] = await Promise.all([
    //   getOrgsUsers(),
    //   getOrgsInvites(),
    // ])
    // if (userResp.status !== 200) {
    //   throw new Error(userResp.data.message)
    // }
    // if (inviteResp.status !== 200) {
    //   throw new Error(inviteResp.data.message)
    // }
    // dispatch(setAll(billing))
  } catch (error) {
    console.error(error)
  }
}
