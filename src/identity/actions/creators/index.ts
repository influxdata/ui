import {QuartzIdentityState} from 'src/identity/reducers'
import {RemoteDataState} from 'src/types'

export const SET_QUARTZ_IDENTITY = 'SET_QUARTZ_IDENTITY'
export const SET_QUARTZ_IDENTITY_STATUS = 'SET_QUARTZ_IDENTITY_STATUS'

export type Actions =
  | ReturnType<typeof setQuartzIdentity>
  | ReturnType<typeof setQuartzIdentityStatus>

export const setQuartzIdentity = (
  identity: QuartzIdentityState,

  // One of these needs to be set
  status: RemoteDataState
) =>
  ({
    type: SET_QUARTZ_IDENTITY,
    identity: identity,
    status,
  } as const)

export const setQuartzIdentityStatus = (status: RemoteDataState) =>
  ({
    type: SET_QUARTZ_IDENTITY_STATUS,
    status,
  } as const)
