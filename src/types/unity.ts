import {RemoteDataState} from '@influxdata/clockface'
import {User as GenUser, Invite as GenInvite} from 'src/client/unityRoutes'

export type Role = 'owner' | 'member'

export interface CloudUser extends GenUser {
  status: RemoteDataState
}
export interface Invite extends GenInvite {
  status: RemoteDataState
}

export type DraftInvite = Omit<GenInvite, 'id' | 'status' | 'expiresAt'>

export interface InviteErrors {
  email?: string[]
}

export interface InviteErrorsJSON {
  errors: InviteErrors
}

export type GetOrgsUsersResult =
  | GetOrgsUsersOKResult
  | GetOrgsUsersDefaultResult

// TODO(watts): remove these when removing the mock calls to unity api
interface GetOrgsUsersOKResult {
  status: 200
  headers: Headers
  data: GenUser[]
}

interface GetOrgsUsersDefaultResult {
  status: 500
  headers: Headers
  data: Error
}

export type GetOrgsInvitesResult =
  | GetOrgsInvitesOKResult
  | GetOrgsInvitesDefaultResult

interface GetOrgsInvitesOKResult {
  status: 200
  headers: Headers
  data: GenInvite[]
}

interface GetOrgsInvitesDefaultResult {
  status: 500
  headers: Headers
  data: Error
}
