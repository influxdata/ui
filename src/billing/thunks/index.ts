import {Dispatch} from 'react'

// Reducer
import {
  Action,
  setBillingInfo,
  setBillingInfoStatus,
} from 'src/billing/reducers'

// API
import {getBillingInfo as apiGetBillingInfo} from 'src/billing/api'

// Types
import {RemoteDataState} from 'src/types'

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
