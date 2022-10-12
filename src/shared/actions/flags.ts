import {RemoteDataState} from 'src/types'
export const SET_FEATURE_FLAGS = 'SET_FEATURE_FLAGS'
export const SET_PUBLIC_FEATURE_FLAGS = 'SET_PUBLIC_FEATURE_FLAGS'
export const RESET_FEATURE_FLAGS = 'RESET_FEATURE_FLAGS'
export const CLEAR_FEATURE_FLAG_OVERRIDES = 'CLEAR_FEATURE_FLAG_OVERRIDES'
export const SET_FEATURE_FLAG_OVERRIDE = 'SET_FEATURE_FLAG_OVERRIDE'
export interface FlagMap {
  [key: string]: string | boolean
}

export type Actions =
  | ReturnType<typeof setFlags>
  | ReturnType<typeof setPublicFlags>
  | ReturnType<typeof reset>
  | ReturnType<typeof clearOverrides>
  | ReturnType<typeof setOverride>

// NOTE: this doesnt have a type as it will be determined
// by the backend at a later time and keeping the format
// open for transformations in a bit
export const setFlags = (status: RemoteDataState, flags?: FlagMap) =>
  ({
    type: SET_FEATURE_FLAGS,
    payload: {
      status,
      flags,
    },
  } as const)

export const setPublicFlags = (flags?: FlagMap) =>
  ({
    type: SET_PUBLIC_FEATURE_FLAGS,
    payload: {
      flags,
    },
  } as const)

export const reset = () =>
  ({
    type: RESET_FEATURE_FLAGS,
  } as const)

export const clearOverrides = () =>
  ({
    type: CLEAR_FEATURE_FLAG_OVERRIDES,
  } as const)

export const setOverride = (flag: string, value: string | boolean) =>
  ({
    type: SET_FEATURE_FLAG_OVERRIDE,
    payload: {
      [flag]: value,
    },
  } as const)
