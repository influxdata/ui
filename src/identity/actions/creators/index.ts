// import {CurrentIdentity} from 'src/identity/reducers'
import {RemoteDataState} from 'src/types'
import {Organization, Identity} from 'src/client/unityRoutes'

export const SET_QUARTZ_IDENTITY = 'SET_QUARTZ_IDENTITY'
export const SET_QUARTZ_IDENTITY_STATUS = 'SET_QUARTZ_IDENTITY_STATUS'
export const SET_CURRENT_BILLING_PROVIDER = 'SET_CURRENT_BILLING_PROVIDER'
export const SET_CURRENT_ORG_DETAILS = 'SET_CURRENT_ORG_DETAILS'

export type Actions =
  | ReturnType<typeof setQuartzIdentity>
  | ReturnType<typeof setQuartzIdentityStatus>
  | ReturnType<typeof setCurrentBillingProvider>
  | ReturnType<typeof setCurrentOrgDetails>

export const setQuartzIdentity = (identity: Identity) =>
  ({
    type: SET_QUARTZ_IDENTITY,
    identity: identity,
  } as const)

// This might need to be a specific string (zuora or otherwise) to be imported
export const setCurrentBillingProvider = (
  billingProvider: 'zuora' | 'aws' | 'gcm' | 'azure'
) =>
  ({
    type: SET_CURRENT_BILLING_PROVIDER,
    billingProvider: billingProvider,
  } as const)

export const setCurrentOrgDetails = (orgDetails: Organization) =>
  ({
    type: SET_CURRENT_ORG_DETAILS,
    org: orgDetails,
  } as const)

export const setQuartzIdentityStatus = (status: RemoteDataState) =>
  ({
    type: SET_QUARTZ_IDENTITY_STATUS,
    status,
  } as const)
