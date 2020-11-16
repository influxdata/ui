import axios, {AxiosResponse} from 'axios'

import {DraftInvite, GetOrgsInvitesResult, Invite} from 'src/types'

import {CloudUser as User, GetOrgsUsersResult} from 'src/types'

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

export const getOrgsInvites = (): Promise<GetOrgsInvitesResult> => {
  const date = new Date()
  date.setDate(date.getDate() + 2)
  const expiresAt = date.toDateString()

  return Promise.resolve({
    status: 200,
    headers: new Headers({'Content-Type': 'application/json'}),
    data: [
      {id: 'i1', email: 'ari@influxdata.com', role: 'owner', expiresAt},
      {id: 'i2', email: 'deniz@influxdata.com', role: 'owner', expiresAt},
      {id: 'i3', email: 'palak@influxdata.com', role: 'owner', expiresAt},
    ],
  })
}

export const createOrgInvite = async (
  orgID: number,
  draftInvite: DraftInvite
): Promise<Invite> => {
  const {
    data: {invite},
  } = await axios.post<{invite: DraftInvite}, AxiosResponse<InviteJSON>>(
    privateAPI(`orgs/${orgID}/invites`),
    {
      invite: draftInvite,
    }
  )

  return invite
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
