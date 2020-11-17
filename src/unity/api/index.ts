import axios, {AxiosResponse} from 'axios'
import uuid from 'uuid'

import {DraftInvite, GetOrgsInvitesResult, Invite} from 'src/types'

import {CloudUser as User, GetOrgsUsersResult} from 'src/types'
import {RemoteDataState} from '@influxdata/clockface'

export interface InviteJSON {
  invite: Invite
}

export const privateAPI = (path: string) => `/api/v2private/${path}`

export const getOrgsUsers = (): Promise<GetOrgsUsersResult> => {
  return Promise.resolve({
    status: 200,
    headers: new Headers({'Content-Type': 'application/json'}),
    data: [
      {id: 'u1', email: 'watts@influxdata.com', role: 'owner'},
      {id: 'u2', email: 'randy@influxdata.com', role: 'owner'},
      {id: 'u3', email: 'iris@influxdata.com', role: 'owner'},
    ],
  })
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
  return Promise.resolve({
    status: 200,
    headers: new Headers({'Content-Type': 'application/json'}),
    data: [
      'ari@influxdata.com',
      'deniz@influxdata.com',
      'palak@influxdata.com',
    ].map(makeInvite),
  })
}

export const createOrgInvite = async (
  _orgID: string,
  draftInvite: DraftInvite
): Promise<Invite> => {
  return Promise.resolve(makeInvite(draftInvite.email))
}

export const deleteOrgInvite = async (
  orgID: string,
  id: string
): Promise<void> => {
  await axios({
    method: 'delete',
    url: privateAPI(`orgs/${orgID}/invites/${id}`),
  })
}

export const resendOrgInvite = async (
  orgID: string,
  id: string
): Promise<Invite> => {
  const {
    data: {invite},
  } = (await axios({
    method: 'post',
    url: privateAPI(`orgs/${orgID}/invites/${id}/resend`),
  })) as AxiosResponse<InviteJSON>

  return invite
}

export const deleteOrgUser = async (
  orgID: string,
  id: string
): Promise<void> => {
  await axios({
    method: 'delete',
    url: privateAPI(`orgs/${orgID}/users/${id}`),
  })
}

export const getUsers = async () =>
  (await axios.get(privateAPI('operator/users'))).data.users as User[]
