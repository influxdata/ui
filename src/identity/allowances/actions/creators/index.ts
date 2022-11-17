// Types
import {RemoteDataState} from 'src/types'

export const SET_ALLOWANCES = 'SET_ALLOWANCES'
export const SET_ALLOWANCES_LOADING_STATUS = 'SET_ALLOWANCES_LOADING_STATUS'

export type Actions =
  | ReturnType<typeof setAllowances>
  | ReturnType<typeof setAllowancesLoadingStatus>

export const setAllowances = allowances =>
  ({
    type: SET_ALLOWANCES,
    allowances: allowances,
  } as const)

export const setAllowancesLoadingStatus = (loadingStatus: RemoteDataState) =>
  ({
    type: SET_ALLOWANCES_LOADING_STATUS,
    loadingStatus: loadingStatus,
  } as const)
