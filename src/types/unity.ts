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
