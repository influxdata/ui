import uuid from 'uuid'

import {
  GetOrgsUsersResult,
  DeleteOrgsInviteResult,
  DeleteOrgsUserResult,
  PostOrgsInvitesResendResult,
  PostOrgsInviteResult,
  DraftInvite,
  GetOrgsInvitesResult,
  Invite,
} from 'src/types'

import {RemoteDataState} from '@influxdata/clockface'

export const users = [
  'watts@influxdata.com',
  'randy@influxdata.com',
  'iris@influxdata.com',
]

export const invites = [
  'ari@influxdata.com',
  'deniz@influxdata.com',
  'palak@influxdata.com',
]

const makeResponse = (status, data, respName, ...args) => {
  console.log(respName) // eslint-disable-line no-console
  for (let i = 0; i < args.length; i++) {
    console.log(args[i]) // eslint-disable-line no-console
  }

  return Promise.resolve({
    status,
    headers: new Headers({'Content-Type': 'application/json'}),
    data,
  })
}

export const getOrgsUsers = (): Promise<GetOrgsUsersResult> => {
  const data = users.map(email => ({id: uuid.v4(), email, role: 'owner'}))

  return makeResponse(200, data, 'getOrgUsers')
}

const makeInvite = (email: string): Invite => {
  const date = new Date()
  date.setDate(date.getDate() + 2)
  const expiresAt = date.toDateString()

  return {
    id: uuid.v4(),
    email,
    role: 'owner',
    expiresAt,
    status: RemoteDataState.Done,
  }
}

export const getOrgsInvites = (): Promise<GetOrgsInvitesResult> => {
  const data = invites.map(makeInvite)

  return makeResponse(200, data, 'getOrgsInvites')
}

export const createOrgInvite = async (
  orgID: string,
  draftInvite: DraftInvite
): Promise<PostOrgsInviteResult> => {
  const data = makeInvite(draftInvite.email)
  return makeResponse(201, data, 'createOrgInvite', orgID, draftInvite)
}

export const deleteOrgInvite = async (
  orgID: string,
  id: string
): Promise<DeleteOrgsInviteResult> => {
  return makeResponse(204, null, 'deleteOrgInvite', orgID, id)
}

export const resendOrgInvite = async (
  orgID: string,
  id: string,
  invite: Invite // TODO(watts): delete this argument when un-mocking
): Promise<PostOrgsInvitesResendResult> => {
  return makeResponse(200, invite, 'resendOrgInvite', orgID, id, invite)
}

export const deleteOrgUser = async (
  orgID: string,
  id: string
): Promise<DeleteOrgsUserResult> => {
  return makeResponse(204, null, 'deleteOrgUser', orgID, id)
}
