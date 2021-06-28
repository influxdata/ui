// Libraries
import {produce} from 'immer'

// Types
<<<<<<< HEAD
import {Secret, ResourceState, RemoteDataState, ResourceType} from 'src/types'
=======
import {Secret, RemoteDataState, SecretsState, ResourceType} from 'src/types'
>>>>>>> 13f44092cb7d2b696603ceac41cf78b9877e0998
import {
  Action,
  REMOVE_SECRET,
  SET_SECRET,
  SET_SECRETS,
} from 'src/secrets/actions/creators'

// Utils
import {
  removeResource,
  setResource,
  setResourceAtID,
} from 'src/resources/reducers/helpers'

<<<<<<< HEAD
type SecretsState = ResourceState['secrets']

export const initialState = (): SecretsState => ({
=======
export const initialState = (): SecretsState => ({
  key: '',
>>>>>>> 13f44092cb7d2b696603ceac41cf78b9877e0998
  status: RemoteDataState.NotStarted,
  byID: {},
  allIDs: [],
})

export const secretsReducer = (
  state: SecretsState = initialState(),
  action: Action
): SecretsState =>
  produce(state, draftState => {
    switch (action.type) {
      case SET_SECRETS: {
        setResource<Secret>(draftState, action, ResourceType.Secrets)

        return
      }

      case SET_SECRET: {
        setResourceAtID<Secret>(draftState, action, ResourceType.Secrets)

        return
      }

      case REMOVE_SECRET: {
        removeResource<Secret>(draftState, action)

        return
      }
    }
  })
