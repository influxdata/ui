import {RemoteDataState} from '@influxdata/clockface'

export type Role = 'owner' | 'member'

export interface CloudUser {
  id: number
  email: string
  role: Role
  firstName: string | null
  lastName: string | null
  status: RemoteDataState
}

export interface Invite {
  id: number
  email: string
  role: Role
  expires_at: string
  status: RemoteDataState
}

export interface LimitStatuses {
  cardinality: LimitStatus
  read: LimitStatus
  write: LimitStatus
}

export interface LimitStatus {
  status: string
}

export type DraftInvite = Omit<Invite, 'id' | 'status' | 'expires_at'>

export interface InviteErrors {
  email?: string[]
}

export interface InviteErrorsJSON {
  errors: InviteErrors
}
