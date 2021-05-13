// Libraries
import {Dispatch} from 'react'

// API
import {resendOrgInvite, deleteOrgInvite, deleteOrgUser} from 'src/users/api'

import {Invite} from 'src/client/unityRoutes'

// Actions
import {
  updateUser,
  removeUser as removeUserAction,
  removeUserStatus,
  Action,
} from 'src/users/reducers'
import {RemoteDataState} from '@influxdata/clockface'

// Types
import {CloudUser as User} from 'src/types'

// Constants
import {GTM_USER_REMOVED} from 'src/users/constants'

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
