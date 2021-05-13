// Constants & Types
import {draftInvite} from 'src/users/constants'
import {CloudUser as User, DraftInvite} from 'src/types'
import {RemoteDataState} from '@influxdata/clockface'

export interface UserListState {
  users: User[]
  draftInvite: DraftInvite
  removeUserStatus: RemoteDataState
}

export const resetDraftInvite = () =>
  ({
    type: 'RESET_DRAFT_INVITE',
  } as const)

export const removeUser = (id: string) =>
  ({
    type: 'REMOVE_USER',
    id,
  } as const)

export const removeUserStatus = (status: RemoteDataState) =>
  ({
    type: 'REMOVE_USER_STATUS',
    status,
  } as const)

export const updateUser = (user: User) =>
  ({
    type: 'UPDATE_USER',
    user,
  } as const)

export type Action =
  | ReturnType<typeof removeUser>
  | ReturnType<typeof resetDraftInvite>
  | ReturnType<typeof updateUser>
  | ReturnType<typeof removeUserStatus>

export type UserListReducer = React.Reducer<UserListState, Action>

export const initialState = ({
  users = [],
  removeUserStatus = RemoteDataState.NotStarted,
}): UserListState => ({
  users,
  draftInvite,
  removeUserStatus,
})

export const userListReducer = (
  state: UserListState,
  action: Action
): UserListState => {
  switch (action.type) {
    case 'REMOVE_USER': {
      return {...state, users: state.users.filter(({id}) => id !== action.id)}
    }

    case 'REMOVE_USER_STATUS': {
      return {...state, removeUserStatus: action.status}
    }

    case 'RESET_DRAFT_INVITE': {
      return {...state, draftInvite}
    }

    case 'UPDATE_USER': {
      return {
        ...state,
        users: state.users.map(user =>
          user.id == action.user.id ? action.user : user
        ),
      }
    }

    default: {
      return state
    }
  }
}
