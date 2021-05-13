// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Utils
import {
  deleteOrgsInvite,
  getOrgsUsers,
  getOrgsInvites,
  postOrgsInvite,
  postOrgsInvitesResend,
  Invite,
} from 'src/client/unityRoutes'
import {notify} from 'src/shared/actions/notifications'

import {
  inviteSent,
  inviteFailed,
  invitationResentSuccessful,
  invitationResentFailed,
  invitationWithdrawnSuccessful,
  invitationWithdrawnFailed,
} from 'src/shared/copy/notifications'

// Types
import {User} from 'src/client/unityRoutes'
import {DraftInvite, RemoteDataState} from 'src/types'
import {getOrg} from 'src/organizations/selectors'

export type Props = {
  children: JSX.Element
}

export interface UsersContextType {
  draftInvite: DraftInvite
  handleEditDraftInvite: (_: DraftInvite) => void
  handleInviteUser: () => void
  handleResendInvite: (inviteId: string) => void
  handleWithdrawInvite: (inviteId: string) => void
  invites: Invite[]
  removeUserStatus: RemoteDataState
  removeInviteStatus: {id: string; status: RemoteDataState}
  resendInviteStatus: RemoteDataState
  status: RemoteDataState
  users: User[]
}

export const draft: DraftInvite = {
  email: '',
  role: 'owner' as const,
}

export const DEFAULT_CONTEXT: UsersContextType = {
  draftInvite: draft,
  handleEditDraftInvite: (_draftInvite: DraftInvite) => {},
  handleInviteUser: () => {},
  handleResendInvite: (_inviteId: string) => {},
  handleWithdrawInvite: (_inviteId: string) => {},
  invites: [],
  removeInviteStatus: {id: null, status: RemoteDataState.NotStarted},
  removeUserStatus: RemoteDataState.NotStarted,
  resendInviteStatus: RemoteDataState.NotStarted,
  status: RemoteDataState.NotStarted,
  users: [],
}

export const UsersContext = React.createContext<UsersContextType>(
  DEFAULT_CONTEXT
)

export const UsersProvider: FC<Props> = React.memo(({children}) => {
  const dispatch = useDispatch()
  const orgId = useSelector(getOrg)?.id
  const [users, setUsers] = useState<User[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [draftInvite, setDraftInvite] = useState<DraftInvite>(draft)
  const [status, setStatus] = useState(RemoteDataState.NotStarted)
  const [removeInviteStatus, setRemoveInviteStatus] = useState({
    id: null,
    status: RemoteDataState.NotStarted,
  })
  const [removeUserStatus, setRemoveUserStatus] = useState(
    RemoteDataState.NotStarted
  )
  // TODO(ariel): this might not be necessary
  const [resendInviteStatus, setResendInviteStatus] = useState(
    RemoteDataState.NotStarted
  )

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

      const users =
        userResp.data?.users?.map(u => ({
          ...u,
        })) ?? []
      const invites =
        inviteResp.data?.invites?.map(i => ({
          ...i,
        })) ?? []

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
        setResendInviteStatus(RemoteDataState.Loading)
        const resp = await postOrgsInvitesResend({orgId, inviteId})

        if (resp.status !== 200) {
          throw new Error(resp.data.message)
        }

        const updateInvites = invites.map(invite =>
          invite.id === resp.data.id ? resp.data : invite
        )

        setInvites(updateInvites)
        setResendInviteStatus(RemoteDataState.Done)
        dispatch(notify(invitationResentSuccessful()))
      } catch (error) {
        setResendInviteStatus(RemoteDataState.Error)
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
        setRemoveInviteStatus({id: inviteId, status: RemoteDataState.Done})
        dispatch(notify(invitationWithdrawnSuccessful()))
      } catch (error) {
        console.error(error)
        dispatch(notify(invitationWithdrawnFailed()))
        setRemoveInviteStatus({id: inviteId, status: RemoteDataState.Error})
      }
    },
    [dispatch, invites, orgId]
  )

  return (
    <UsersContext.Provider
      value={{
        draftInvite,
        handleEditDraftInvite,
        handleInviteUser,
        handleResendInvite,
        handleWithdrawInvite,
        invites,
        removeInviteStatus,
        removeUserStatus,
        resendInviteStatus,
        status,
        users,
      }}
    >
      {children}
    </UsersContext.Provider>
  )
})

export default UsersProvider
