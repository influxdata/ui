import {RemoteDataState} from '@influxdata/clockface'
import {
  User as GenUser,
  Invite as GenInvite,
  CheckoutRequest as GenCheckoutRequest,
} from 'src/client/unityRoutes'

export type Role = 'owner' | 'member'

export interface CloudUser extends GenUser {
  status: RemoteDataState
}
export interface Invite extends GenInvite {
  status: RemoteDataState
}

export interface CheckoutRequest extends GenCheckoutRequest {
  status: RemoteDataState
}

export type DraftInvite = Omit<GenInvite, 'id' | 'status' | 'expiresAt'>

export interface InviteErrors {
  email?: string[]
}

export interface InviteErrorsJSON {
  errors: InviteErrors
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

export type PostAccountUpgradeResult =
  | PostAccountUpgradedResult
  | PostAccountUpgradeDefaultResult

interface PostAccountUpgradedResult {
  status: 201
  headers: Headers
  data: Invite
}

interface PostAccountUpgradeDefaultResult {
  status: 500
  headers: Headers
  data: Error
}
