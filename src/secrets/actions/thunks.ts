// Libraries
import {normalize} from 'normalizr'

// API
import {
  getOrgsSecrets as apiGetSecrets,
  patchOrgsSecrets as apiUpdateSecret,
  postOrgsSecretsDelete as apiDeleteSecret,
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
  const processedData = []
  response.forEach(element => processedData.push({id: element, key: element}))
  return processedData
}

export const getSecrets = () => async (
  dispatch: Dispatch<Action>,
  getState: GetState
) => {
  const state = getState()
  if (getStatus(state, ResourceType.Secrets) === RemoteDataState.NotStarted) {
    dispatch(setSecrets(RemoteDataState.Loading))
  }

  const org = getOrg(state)

  const resp = await apiGetSecrets({orgID: org.id})

  if (resp.status === 200) {
    const secrets = makeEntitiesForSecrets(resp.data.secrets)
    const test = normalize<Secret, SecretEntities, string[]>(
      secrets,
      arrayOfSecrets
    )
    dispatch(setSecrets(RemoteDataState.Done, test))
  } else {
    console.error(resp.data.message)
    dispatch(setSecrets(RemoteDataState.Error))
    dispatch(notify(getSecretsFailed()))
  }
}

export const upsertSecret = (_secretKey: string, secretValue: string) => async (
  dispatch: Dispatch<Action>,
  getState: GetState
): Promise<void> => {
  const org = getOrg(getState())
  const resp = await apiUpdateSecret({
    orgID: org.id,
    data: {
      _secretKey: secretValue,
    },
  })

  if (resp.status === 204) {
    const secret = normalize<Secret, SecretEntities, string>(
      resp.data.secret,
      secretsSchema
    )
    dispatch(setSecret(resp.data.secret.id, RemoteDataState.Done, secret))
  } else {
    console.error(resp.data.message)
    dispatch(notify(upsertSecretFailed()))
  }
}

export const deleteSecret = (id: string) => async (
  dispatch: Dispatch<Action>,
  getState: GetState
) => {
  const org = getOrg(getState())
  const resp = await apiDeleteSecret({
    orgID: org.id,
    data: {
      secrets: [id],
    },
  })

  if (resp.status === 204) {
    dispatch(removeSecret(id))
  } else {
    console.error(resp.data.message)
    dispatch(notify(deleteSecretsFailed()))
  }
}
