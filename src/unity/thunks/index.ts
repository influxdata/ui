// Libraries
import {Dispatch} from 'react'

// API
import {
  getOrgsInvites,
  getOrgsUsers,
  resendOrgInvite,
  deleteOrgInvite,
  deleteOrgUser,
} from 'src/unity/api'

// Actions
import {
  setAll,
  updateUser,
  updateInvite,
  removeInvite,
  removeUser as removeUserAction,
  removeUserStatus,
  removeInviteStatus,
  resendInviteStatus,
  Action,
} from '../reducers'
import {RemoteDataState} from '@influxdata/clockface'

// Types
import {Invite, CloudUser as User} from 'src/types'

// Constants
import {GTM_USER_REMOVED} from 'src/unity/constants'

export const getUsersAndInvites = async (dispatch: Dispatch<Action>) => {
  try {
    const [userResp, inviteResp] = await Promise.all([
      getOrgsUsers(),
      getOrgsInvites(),
    ])

    if (userResp.status !== 200) {
      throw new Error(userResp.data.message)
    }

    if (inviteResp.status !== 200) {
      throw new Error(inviteResp.data.message)
    }

    const users = userResp.data.map(u => ({
      ...u,
      status: RemoteDataState.Done,
    }))
    const invites = inviteResp.data.map(i => ({
      ...i,
      status: RemoteDataState.Done,
    }))

    dispatch(setAll(users, invites, RemoteDataState.Done))
  } catch (error) {
    dispatch(setAll([], [], RemoteDataState.Error))
    console.error(error)
  }
}

export const resendInvite = async (
  dispatch: Dispatch<Action>,
  orgID: string,
  id: string,
  invite: Invite // TODO(watts): delete this argument when un-mocking
) => {
  try {
    dispatch(resendInviteStatus(RemoteDataState.Loading))
    const resp = await resendOrgInvite(orgID, id, invite)

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    dispatch(updateInvite(resp.data))
    dispatch(resendInviteStatus(RemoteDataState.Done))
  } catch (error) {
    dispatch(resendInviteStatus(RemoteDataState.Error))
    console.error(error)
  }
}

export const withdrawInvite = async (
  dispatch: Dispatch<Action>,
  orgID: string,
  invite: Invite
) => {
  try {
    dispatch(updateInvite({...invite, status: RemoteDataState.Loading}))

    const resp = await deleteOrgInvite(orgID, invite.id)

    if (resp.status !== 204) {
      throw new Error(resp.data.message)
    }

    dispatch(removeInvite(invite.id))
    dispatch(removeInviteStatus(RemoteDataState.Done))
  } catch (error) {
    console.error(error)

    dispatch(updateInvite({...invite, status: RemoteDataState.Error}))
    dispatch(removeInviteStatus(RemoteDataState.Error))
  }
}

export const removeUser = async (
  dispatch: Dispatch<Action>,
  user: User,
  orgID: string
) => {
  try {
    dispatch(updateUser({...user, status: RemoteDataState.Loading}))

    await deleteOrgUser(orgID, user.id)

    dispatch(removeUserAction(user.id))
    dispatch(removeUserStatus(RemoteDataState.Done))

    window.dataLayer.push({
      event: GTM_USER_REMOVED,
    })
  } catch (error) {
    console.error(error)

    dispatch(updateUser({...user, status: RemoteDataState.Error}))
    dispatch(removeUserStatus(RemoteDataState.Error))
  }
}
