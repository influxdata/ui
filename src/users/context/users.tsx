// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Utils
import {
  getOrgsUsers,
  getOrgsInvites,
  postOrgsInvite,
  Invite,
} from 'src/client/unityRoutes'

// Constants

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
  invites: Invite[]
  removeUserStatus: RemoteDataState
  removeInviteStatus: RemoteDataState
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
  handleEditDraftInvite: (_: DraftInvite) => {},
  handleInviteUser: () => {},
  invites: [],
  removeInviteStatus: RemoteDataState.NotStarted,
  removeUserStatus: RemoteDataState.NotStarted,
  resendInviteStatus: RemoteDataState.NotStarted,
  status: RemoteDataState.NotStarted,
  users: [],
}

export const UsersContext = React.createContext<UsersContextType>(
  DEFAULT_CONTEXT
)

export const UsersProvider: FC<Props> = React.memo(({children}) => {
  const orgId = useSelector(getOrg)?.id
  const [users, setUsers] = useState<User[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [draftInvite, setDraftInvite] = useState<DraftInvite>(draft)
  const [status, setStatus] = useState(RemoteDataState.NotStarted)
  const [removeInviteStatus, setRemoveInviteStatus] = useState(
    RemoteDataState.NotStarted
  )
  const [removeUserStatus, setRemoveUserStatus] = useState(
    RemoteDataState.NotStarted
  )
  const [resendInviteStatus, setRemoveInviteStatus] = useState(
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
      // TODO(ariel): notify that the invite was sent successfully
      // saying "invitation sent"
    } catch (error) {
      // TODO(ariel): notify that the invite failed
      console.error(error)
    }
  }, [orgId, draftInvite])

  const handleEditDraftInvite = useCallback(
    (draft: DraftInvite) => {
      setDraftInvite(draft)
    },
    [setDraftInvite]
  )

  return (
    <UsersContext.Provider
      value={{
        draftInvite,
        handleEditDraftInvite,
        handleInviteUser,
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
