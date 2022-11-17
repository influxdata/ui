import {OrgCreationAllowance} from 'src/identity/apis/org'
import {RemoteDataState} from 'src/types'

export const SET_ORG_CREATION_ALLOWANCE = 'SET_ORG_CREATION_ALLOWANCE'
export const SET_ORG_CREATION_ALLOWANCE_STATUS =
  'SET_ORG_CREATION_ALLOWANCE_STATUS'

export type OrgCreationAllowanceActions =
  | ReturnType<typeof setOrgCreationAllowance>
  | ReturnType<typeof setOrgCreationAllowanceStatus>

export const setOrgCreationAllowance = (allowances: OrgCreationAllowance) =>
  ({
    type: SET_ORG_CREATION_ALLOWANCE,
    allowances: allowances,
  } as const)

export const setOrgCreationAllowanceStatus = (loadingStatus: RemoteDataState) =>
  ({
    type: SET_ORG_CREATION_ALLOWANCE_STATUS,
    loadingStatus: loadingStatus,
  } as const)
