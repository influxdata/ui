import {OrgCreationAllowances} from 'src/identity/apis/org'
import {RemoteDataState} from 'src/types'

export const SET_ORG_CREATION_ALLOWANCES = 'SET_ORG_CREATION_ALLOWANCES'
export const SET_ORG_CREATION_ALLOWANCES_STATUS =
  'SET_ORG_CREATION_ALLOWANCES_STATUS'

export type Actions =
  | ReturnType<typeof setOrgCreationAllowances>
  | ReturnType<typeof setOrgCreationAllowancesStatus>

export const setOrgCreationAllowances = (allowances: OrgCreationAllowances) =>
  ({
    type: SET_ORG_CREATION_ALLOWANCES,
    allowances: allowances,
  } as const)

export const setOrgCreationAllowancesStatus = (
  loadingStatus: RemoteDataState
) =>
  ({
    type: SET_ORG_CREATION_ALLOWANCES_STATUS,
    loadingStatus: loadingStatus,
  } as const)
