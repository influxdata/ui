// Libraries
import {normalize} from 'normalizr'

// API
import {
  getOrgsSecrets as apiGetSecrets,
  patchOrgsSecrets as apiUpdateSecret,
  deleteOrgsSecret as apiDeleteSecret,
} from 'src/client'

// Schemas
import {secretsSchema, arrayOfSecrets} from 'src/schemas/secrets'

// Types
import {Dispatch} from 'react'
import {
  RemoteDataState,
  GetState,
  ResourceType,
  Secret,
  SecretEntities,
} from 'src/types'

// Actions
import {notify} from 'src/shared/actions/notifications'
import {
  getSecretsFailed,
  upsertSecretFailed,
  deleteSecretsFailed,
} from 'src/shared/copy/notifications'
import {
  setSecrets,
  setSecret,
  removeSecret,
  Action,
} from 'src/secrets/actions/creators'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {getStatus} from 'src/resources/selectors'

const makeEntitiesForSecrets = (response: Array<string>) => {
  return response.map(element => ({id: element, key: element}))
}

export const getSecrets =
  () => async (dispatch: Dispatch<Action>, getState: GetState) => {
    try {
      const state = getState()
      if (
        getStatus(state, ResourceType.Secrets) === RemoteDataState.NotStarted
      ) {
        dispatch(setSecrets(RemoteDataState.Loading))
      }

      const org = getOrg(state)

      const resp = await apiGetSecrets({orgID: org.id})

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      const secrets = makeEntitiesForSecrets(resp.data.secrets)
      const test = normalize<Secret, SecretEntities, string[]>(
        secrets,
        arrayOfSecrets
      )
      dispatch(setSecrets(RemoteDataState.Done, test))
    } catch (error) {
      console.error(error)
      dispatch(setSecrets(RemoteDataState.Error))
      dispatch(notify(getSecretsFailed()))
    }
  }

export const upsertSecret =
  (newSecret: Secret) =>
  async (dispatch: Dispatch<Action>, getState: GetState): Promise<void> => {
    try {
      const org = getOrg(getState())
      const resp = await apiUpdateSecret({
        orgID: org.id,
        data: {
          [newSecret.id]: newSecret.value,
        },
      })

      if (resp.status !== 204) {
        throw new Error()
      }

      // Secret values shouldn't be kept around in the store! -JF
      const strippedSecret = {id: newSecret.id}

      const secret = normalize<Secret, SecretEntities, string>(
        strippedSecret,
        secretsSchema
      )

      dispatch(setSecret(newSecret.id, RemoteDataState.Done, secret))
    } catch (error) {
      console.error(error)
      dispatch(notify(upsertSecretFailed()))
    }
  }

export const deleteSecret =
  (secret: Secret) =>
  async (dispatch: Dispatch<Action>, getState: GetState) => {
    try {
      const org = getOrg(getState())
      const resp = await apiDeleteSecret({
        orgID: org.id,
        secretID: secret.id,
      })

      if (resp.status !== 204) {
        throw new Error(resp.data.message)
      }

      dispatch(removeSecret(secret.id))
    } catch (error) {
      console.error(error)
      dispatch(notify(deleteSecretsFailed()))
    }
  }
