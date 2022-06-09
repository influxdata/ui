import {QuartzIdentityState} from 'src/identity/reducers'
import {RemoteDataState} from 'src/types'

export const SET_QUARTZ_IDENTITY = 'SET_QUARTZ_IDENTITY'
export const SET_QUARTZ_IDENTITY_STATUS = 'SET_QUARTZ_IDENTITY_STATUS'
export const SET_CURRENT_BILLING_PROVIDER = 'SET_CURRENT_BILLING_PROVIDER'

export type Actions =
  | ReturnType<typeof setQuartzIdentity>
  | ReturnType<typeof setQuartzIdentityStatus>

export const setQuartzIdentity = (
  identity: QuartzIdentityState,
  status: RemoteDataState
) =>
  ({
    type: SET_QUARTZ_IDENTITY,
    identity: identity,
    status,
  } as const)

// This might need to be a specific string (zuora or otherwise) to be imported
export const setCurrentBillingProvider = (billingProvider: string) =>
  ({
    type: SET_CURRENT_BILLING_PROVIDER,
  } as const)

export const setQuartzIdentityStatus = (status: RemoteDataState) =>
  ({
    type: SET_QUARTZ_IDENTITY_STATUS,
    status,
  } as const)
