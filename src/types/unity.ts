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

// TODO(watts): delete everything below this line
// once the mock API's are replaced with actual calls the Quartz
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

export type DeleteOrgsInviteResult =
  | DeleteOrgsInviteNoContentResult
  | DeleteOrgsInviteDefaultResult

export interface DeleteOrgsInviteNoContentResult {
  status: 204
  headers: Headers
  data: any
}

export interface DeleteOrgsInviteDefaultResult {
  status: 500
  headers: Headers
  data: Error
}

export type PostOrgsInvitesResendResult =
  | PostOrgsInvitesResendOKResult
  | PostOrgsInvitesResendDefaultResult

interface PostOrgsInvitesResendOKResult {
  status: 200
  headers: Headers
  data: Invite
}

interface PostOrgsInvitesResendDefaultResult {
  status: 500
  headers: Headers
  data: Error
}

export type DeleteOrgsUserResult =
  | DeleteOrgsUserNoContentResult
  | DeleteOrgsUserDefaultResult

interface DeleteOrgsUserNoContentResult {
  status: 204
  headers: Headers
  data: null
}

interface DeleteOrgsUserDefaultResult {
  status: 500
  headers: Headers
  data: Error
}

export type PostOrgsInviteResult =
  | PostOrgsInviteCreatedResult
  | PostOrgsInviteDefaultResult

interface PostOrgsInviteCreatedResult {
  status: 201
  headers: Headers
  data: Invite
}

interface PostOrgsInviteDefaultResult {
  status: 500
  headers: Headers
  data: Error
}
