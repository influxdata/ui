// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Utils
import {
  deleteOrgsInvite,
  deleteOrgsUser,
  getOrgsUsers,
  getOrgsInvites,
  postOrgsInvite,
  postOrgsInvitesResend,
} from 'src/client/unityRoutes'

// Notifications
import {notify} from 'src/shared/actions/notifications'
import {
  inviteSent,
  inviteFailed,
  invitationResentSuccessful,
  invitationResentFailed,
  invitationWithdrawnSuccessful,
  invitationWithdrawnFailed,
  removeUserFailed,
  removeUserSuccessful,
} from 'src/shared/copy/notifications'

// Constants
import {GTM_USER_REMOVED} from 'src/users/constants'

// Types
import {CloudUser, DraftInvite, Invite, RemoteDataState} from 'src/types'
import {getOrg} from 'src/organizations/selectors'

export type Props = {
  children: JSX.Element
}

export interface UsersContextType {
  draftInvite: DraftInvite
  handleEditDraftInvite: (_: DraftInvite) => void
  handleInviteUser: () => void
  handleRemoveUser: (userId: string) => void
  handleResendInvite: (inviteId: string) => void
  handleWithdrawInvite: (inviteId: string) => void
  invites: Invite[]
  removeInviteStatus: {id: string; status: RemoteDataState}
  removeUserStatus: {id: string; status: RemoteDataState}
  status: RemoteDataState
  users: CloudUser[]
}

export const draft: DraftInvite = {
  email: '',
  role: 'owner' as const,
}

export const DEFAULT_CONTEXT: UsersContextType = {
  draftInvite: draft,
  handleEditDraftInvite: (_draftInvite: DraftInvite) => {},
  handleInviteUser: () => {},
  handleRemoveUser: (_userId: string) => {},
  handleResendInvite: (_inviteId: string) => {},
  handleWithdrawInvite: (_inviteId: string) => {},
  invites: [],
  removeInviteStatus: {id: null, status: RemoteDataState.NotStarted},
  removeUserStatus: {id: null, status: RemoteDataState.NotStarted},
  status: RemoteDataState.NotStarted,
  users: [],
}

export const UsersContext = React.createContext<UsersContextType>(
  DEFAULT_CONTEXT
)

export const UsersProvider: FC<Props> = React.memo(({children}) => {
  const dispatch = useDispatch()
  const orgId = useSelector(getOrg)?.id
  const [users, setUsers] = useState<CloudUser[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [draftInvite, setDraftInvite] = useState<DraftInvite>(draft)
  const [status, setStatus] = useState(RemoteDataState.NotStarted)
  const [removeInviteStatus, setRemoveInviteStatus] = useState({
    id: null,
    status: RemoteDataState.NotStarted,
  })
  const [removeUserStatus, setRemoveUserStatus] = useState({
    id: null,
    status: RemoteDataState.NotStarted,
  })

  const getUsersAndInvites = useCallback(async () => {
    try {
      const [userResp, inviteResp] = await Promise.all([
        getOrgsUsers({orgId}),
        getOrgsInvites({orgId}),
      ])

      if (userResp.status !== 200) {
        throw new Error(userResp.data.message)
      }

      if (inviteResp.status !== 200) {
        throw new Error(inviteResp.data.message)
      }

      const users = userResp?.data ?? []
      const invites = inviteResp?.data ?? []

      setUsers(users)
      setInvites(invites)
      setStatus(RemoteDataState.Done)
    } catch (error) {
      setUsers([])
      setInvites([])
      setStatus(RemoteDataState.Error)
      console.error(error)
    }
  }, [orgId])

  useEffect(() => {
    getUsersAndInvites()
  }, [getUsersAndInvites])

  const handleInviteUser = useCallback(async () => {
    try {
      const resp = await postOrgsInvite({orgId, data: draftInvite})

      if (resp.status !== 201) {
        throw new Error(resp.data.message)
      }

      setInvites(prevInvites => [resp.data, ...prevInvites])
      dispatch(notify(inviteSent()))
    } catch (error) {
      dispatch(notify(inviteFailed()))
      console.error(error)
    }
  }, [dispatch, draftInvite, orgId])

  const handleEditDraftInvite = useCallback(
    (draft: DraftInvite) => {
      setDraftInvite(draft)
    },
    [setDraftInvite]
  )

  const handleResendInvite = useCallback(
    async (inviteId: string) => {
      try {
        const resp = await postOrgsInvitesResend({orgId, inviteId})

        if (resp.status !== 200) {
          throw new Error(resp.data.message)
        }

        const updateInvites = invites.map(invite =>
          invite.id === resp.data.id ? resp.data : invite
        )

        setInvites(updateInvites)
        dispatch(notify(invitationResentSuccessful()))
      } catch (error) {
        dispatch(notify(invitationResentFailed()))
        console.error(error)
      }
    },
    [dispatch, invites, orgId]
  )

  const handleWithdrawInvite = useCallback(
    async (inviteId: string) => {
      try {
        setRemoveInviteStatus({id: inviteId, status: RemoteDataState.Loading})
        const resp = await deleteOrgsInvite({orgId, inviteId})

        if (resp.status !== 204) {
          throw new Error(resp.data.message)
        }

        const updateInvites = invites.filter(({id}) => id !== inviteId)

        setInvites(updateInvites)
        setRemoveInviteStatus({id: null, status: RemoteDataState.Done})
        dispatch(notify(invitationWithdrawnSuccessful()))
      } catch (error) {
        console.error(error)
        dispatch(notify(invitationWithdrawnFailed()))
        setRemoveInviteStatus({id: inviteId, status: RemoteDataState.Error})
      }
    },
    [dispatch, invites, orgId]
  )

  const handleRemoveUser = useCallback(
    async (userId: string) => {
      try {
        setRemoveUserStatus({
          id: userId,
          status: RemoteDataState.Loading,
        })

        await deleteOrgsUser({orgId, userId})

        const updatedUsers = users.filter(({id}) => userId !== id)

        setUsers(updatedUsers)
        setRemoveUserStatus({
          id: null,
          status: RemoteDataState.Done,
        })
        dispatch(notify(removeUserSuccessful()))
        window.dataLayer.push({
          event: GTM_USER_REMOVED,
        })
      } catch (error) {
        console.error(error)
        dispatch(notify(removeUserFailed()))
        setRemoveUserStatus({
          id: userId,
          status: RemoteDataState.Error,
        })
      }
    },
    [dispatch, orgId, users]
  )

  return (
    <UsersContext.Provider
      value={{
        draftInvite,
        handleEditDraftInvite,
        handleInviteUser,
        handleRemoveUser,
        handleResendInvite,
        handleWithdrawInvite,
        invites,
        removeInviteStatus,
        removeUserStatus,
        status,
        users,
      }}
    >
      {children}
    </UsersContext.Provider>
  )
})

export default UsersProvider
