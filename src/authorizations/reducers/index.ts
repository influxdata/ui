// Libraries
import {produce} from 'immer'

// Types
import {
  RemoteDataState,
  ResourceState,
  ResourceType,
  Authorization,
} from 'src/types'
import {
  Action,
  SET_AUTH,
  ADD_AUTH,
  EDIT_AUTH,
  REMOVE_AUTH,
  SET_CURRENT_AUTH,
  SET_ALL_RESOURCES
} from 'src/authorizations/actions/creators'

// Utils
import {
  setResource,
  addResource,
  removeResource,
  editResource,
} from 'src/resources/reducers/helpers'

type AuthsState = ResourceState['tokens']
const {Authorizations} = ResourceType

const initialState = (): AuthsState => ({
  status: RemoteDataState.NotStarted,
  byID: {},
  allIDs: [],
  currentAuth: { status: RemoteDataState.NotStarted, item: {} },
  allResources: {status: RemoteDataState.NotStarted, list: []}
})

export const authsReducer = (
  state: AuthsState = initialState(),
  action: Action
): AuthsState =>
  produce(state, draftState => {
    switch (action.type) {
      case SET_AUTH: {
        setResource<Authorization>(draftState, action, Authorizations)

        return
      }

      case ADD_AUTH: {
        addResource<Authorization>(draftState, action, Authorizations)

        return
      }

      case REMOVE_AUTH: {
        removeResource<Authorization>(draftState, action)

        return
      }

      case EDIT_AUTH: {
        editResource<Authorization>(draftState, action, Authorizations)

        return
      }

      case SET_CURRENT_AUTH: {
        const {status, item} = action
        draftState.currentAuth.status = status

        if (item) {
          draftState.currentAuth.item = item
        } else {
          draftState.currentAuth.item = {}
        }

        return
      }
        
      case SET_ALL_RESOURCES: {
        const { status, list } = action
        draftState.allResources.status = status

        if (list) {
          draftState.allResources.list = list
        }
        else {
          draftState.allResources.list = []
        }

        return
      }
    }
  })
