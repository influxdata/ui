// Types
import {RemoteDataState, SecretEntities} from 'src/types'
import {Action as NotifyAction} from 'src/shared/actions/notifications'
import {NormalizedSchema} from 'normalizr'

export type Action =
  | ReturnType<typeof removeSecret>
  | ReturnType<typeof setSecret>
  | ReturnType<typeof setSecrets>
  | NotifyAction

export const SET_SECRETS = 'SET_SECRETS'
export const SET_SECRET = 'SET_SECRET'
export const REMOVE_SECRET = 'REMOVE_SECRET'
export const SET_SECRET_ON_RESOURCE = 'SET_SECRET_ON_RESOURCE'

type SecretsSchema<R extends string | string[]> = NormalizedSchema<
  SecretEntities,
  R
>

export const setSecrets = (
  status: RemoteDataState,
  schema?: SecretsSchema<string[]>
) =>
  ({
    type: SET_SECRETS,
    status,
    schema,
  } as const)

export const setSecret = (
  id: string,
  status: RemoteDataState,
  schema?: SecretsSchema<string>
) =>
  ({
    type: SET_SECRET,
    id,
    status,
    schema,
  } as const)

export const removeSecret = (id: string) =>
  ({
    type: REMOVE_SECRET,
    id,
  } as const)

export const setSecretOnResource = (
  resourceID: string,
  schema: SecretsSchema<string>
) =>
  ({
    type: SET_SECRET_ON_RESOURCE,
    resourceID,
    schema,
  } as const)
