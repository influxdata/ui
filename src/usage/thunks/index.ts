// Libraries
import {Dispatch} from 'react'

// API
import {getBillingDate as apiGetBillingDate} from 'src/usage/api'

// Actions
import {setBillingDate, setBillingDateStatus, Action} from 'src/usage/reducer'

// Types
import {RemoteDataState} from 'src/types'

export const getBillingDate = async (dispatch: Dispatch<Action>) => {
  try {
    dispatch(setBillingDateStatus(RemoteDataState.Loading))
    const resp = await apiGetBillingDate

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    dispatch(setBillingDate({...resp.data, status: RemoteDataState.Done}))
  } catch (error) {
    dispatch(setBillingDateStatus(RemoteDataState.Error))
    console.error(error)
  }
}
