// Types
import {RemoteDataState, AuthEntities, Authorization} from 'src/types'
import {NormalizedSchema} from 'normalizr'

export const SET_AUTH = 'SET_AUTH'
export const ADD_AUTH = 'ADD_AUTH'
export const EDIT_AUTH = 'EDIT_AUTH'
export const REMOVE_AUTH = 'REMOVE_AUTH'
export const SET_CURRENT_AUTH = 'SET_CURRENT_AUTH'
export const SET_ALL_RESOURCES = 'SET_ALL_RESOURCES'

export type Action =
  | ReturnType<typeof setAuthorizations>
  | ReturnType<typeof addAuthorization>
  | ReturnType<typeof editAuthorization>
  | ReturnType<typeof removeAuthorization>
  | ReturnType<typeof setCurrentAuthorization>
  | ReturnType<typeof setAllResources>

export const setAuthorizations = (
  status: RemoteDataState,
  schema?: NormalizedSchema<AuthEntities, string[]>
) =>
  ({
    type: SET_AUTH,
    status,
    schema,
  } as const)

export const addAuthorization = (
  schema: NormalizedSchema<AuthEntities, string>
) =>
  ({
    type: ADD_AUTH,
    schema,
  } as const)

export const editAuthorization = (
  schema: NormalizedSchema<AuthEntities, string>
) =>
  ({
    type: EDIT_AUTH,
    schema,
  } as const)

export const removeAuthorization = (id: string) =>
  ({
    type: REMOVE_AUTH,
    id,
  } as const)

export const setCurrentAuthorization = (
  status: RemoteDataState,
  item?: Authorization
) =>
  ({
    type: SET_CURRENT_AUTH,
    status,
    item,
  } as const)

export const setAllResources = (list?: string[]) =>
  ({
    type: SET_ALL_RESOURCES,
    list,
  } as const)
