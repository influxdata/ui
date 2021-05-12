// Constants & Types
import {draftInvite} from 'src/users/constants'
import {CloudUser as User, Invite, DraftInvite} from 'src/types'
import {RemoteDataState} from '@influxdata/clockface'

export interface UserListState {
  users: User[]
  invites: Invite[]
  draftInvite: DraftInvite
  status: RemoteDataState
  orgID: string
  removeUserStatus: RemoteDataState
  removeInviteStatus: RemoteDataState
  resendInviteStatus: RemoteDataState
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

export const removeInvite = (id: string) =>
  ({
    type: 'REMOVE_INVITE',
    id,
  } as const)

export const removeInviteStatus = (status: RemoteDataState) =>
  ({
    type: 'REMOVE_INVITE_STATUS',
    status,
  } as const)

export const resendInviteStatus = (status: RemoteDataState) =>
  ({
    type: 'RESEND_INVITE_STATUS',
    status,
  } as const)

export const updateInvite = (invite: Invite) =>
  ({
    type: 'UPDATE_INVITE',
    invite,
  } as const)

export const updateUser = (user: User) =>
  ({
    type: 'UPDATE_USER',
    user,
  } as const)

export type Action =
  | ReturnType<typeof removeUser>
  | ReturnType<typeof removeInvite>
  | ReturnType<typeof resetDraftInvite>
  | ReturnType<typeof updateInvite>
  | ReturnType<typeof updateUser>
  | ReturnType<typeof removeUserStatus>
  | ReturnType<typeof removeInviteStatus>
  | ReturnType<typeof resendInviteStatus>

export type UserListReducer = React.Reducer<UserListState, Action>

export const initialState = ({
  invites = [],
  users = [],
  orgID,
  status = RemoteDataState.NotStarted,
  removeUserStatus = RemoteDataState.NotStarted,
  removeInviteStatus = RemoteDataState.NotStarted,
  resendInviteStatus = RemoteDataState.NotStarted,
}): UserListState => ({
  users,
  invites,
  draftInvite,
  status,
  orgID,
  removeUserStatus,
  removeInviteStatus,
  resendInviteStatus,
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

    case 'REMOVE_INVITE_STATUS': {
      return {...state, removeInviteStatus: action.status}
    }

    case 'RESEND_INVITE_STATUS': {
      return {...state, resendInviteStatus: action.status}
    }

    case 'REMOVE_INVITE': {
      return {
        ...state,
        invites: state.invites.filter(({id}) => id !== action.id),
      }
    }

    case 'RESET_DRAFT_INVITE': {
      return {...state, draftInvite}
    }

    case 'UPDATE_INVITE': {
      return {
        ...state,
        invites: state.invites.map(invite =>
          invite.id == action.invite.id ? action.invite : invite
        ),
      }
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
