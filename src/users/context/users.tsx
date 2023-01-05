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
  memberAddSuccess,
} from 'src/shared/copy/notifications'

// Constants
import {GTM_USER_REMOVED} from 'src/users/constants'

// Types
import {CloudUser, DraftInvite, Invite, RemoteDataState} from 'src/types'
import {getOrg} from 'src/organizations/selectors'
import {getMe} from 'src/me/selectors'
import {CLOUD_URL} from 'src/shared/constants'

export type Props = {
  children: JSX.Element
}

export interface UsersContextType {
  draftInvite: DraftInvite
  handleEditDraftInvite: (_: DraftInvite) => void
  handleInviteUser: () => void
  removeUser: (userId: string) => void
  handleResendInvite: (inviteId: number) => void
  handleWithdrawInvite: (inviteId: number) => void
  invites: Invite[]
  removeInviteStatus: {id: number; status: RemoteDataState}
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
  removeUser: (_userId: string) => {},
  handleResendInvite: (_inviteId: number) => {},
  handleWithdrawInvite: (_inviteId: number) => {},
  invites: [],
  removeInviteStatus: {id: null, status: RemoteDataState.NotStarted},
  removeUserStatus: {id: null, status: RemoteDataState.NotStarted},
  status: RemoteDataState.NotStarted,
  users: [],
}

export const UsersContext =
  React.createContext<UsersContextType>(DEFAULT_CONTEXT)

export const UsersProvider: FC<Props> = React.memo(({children}) => {
  const dispatch = useDispatch()
  const org = useSelector(getOrg)
  const orgId = org?.id
  const orgName = org?.name

  const currentUserId = useSelector(getMe)?.id

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

      switch (resp.status) {
        case 201:
          setInvites(prevInvites => [resp.data, ...prevInvites])
          dispatch(notify(inviteSent({email: resp.data.email, orgName})))
          setDraftInvite(draft)
          break
        case 200:
          setUsers(prevUsers => [resp.data, ...prevUsers])
          dispatch(notify(memberAddSuccess(resp.data.email)))
          setDraftInvite(draft)
          break
        default:
          throw new Error(resp.data.message)
      }
    } catch (error) {
      dispatch(notify(inviteFailed()))
      console.error(error)
    }
  }, [dispatch, draftInvite, orgId, orgName])

  const handleEditDraftInvite = useCallback(
    (draft: DraftInvite) => {
      setDraftInvite(draft)
    },
    [setDraftInvite]
  )

  const handleResendInvite = useCallback(
    async (inviteId: number) => {
      try {
        const resp = await postOrgsInvitesResend({
          orgId,
          inviteId,
        })

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
    async (inviteId: number) => {
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

  const removeUser = useCallback(
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

        if (userId == currentUserId) {
          window.location.href = CLOUD_URL
        }
      } catch (error) {
        console.error(error)
        dispatch(notify(removeUserFailed()))
        setRemoveUserStatus({
          id: userId,
          status: RemoteDataState.Error,
        })
      }
    },
    [currentUserId, dispatch, orgId, users]
  )

  return (
    <UsersContext.Provider
      value={{
        draftInvite,
        handleEditDraftInvite,
        handleInviteUser,
        removeUser,
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
