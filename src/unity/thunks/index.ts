// Libraries
import {Dispatch} from 'react'

// API
import {resendOrgInvite, deleteOrgInvite, deleteOrgUser} from 'src/unity/api'

// Actions
import {
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

export const resendInvite = async (
  dispatch: Dispatch<Action>,
  orgID: string,
  id: number
) => {
  try {
    dispatch(resendInviteStatus(RemoteDataState.Loading))
    const invite = await resendOrgInvite(orgID, id)

    dispatch(updateInvite(invite))
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

    await deleteOrgInvite(orgID, invite.id)

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
