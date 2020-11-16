import axios, {AxiosResponse} from 'axios'

import {DraftInvite, Invite} from 'src/types'

import {CloudUser as User} from 'src/types'

export interface InviteJSON {
  invite: Invite
}

export const privateAPI = (path: string) => `/api/v2private/${path}`

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
  id: number
): Promise<void> => {
  await axios({
    method: 'delete',
    url: privateAPI(`orgs/${orgID}/invites/${id}`),
  })
}

export const resendOrgInvite = async (
  orgID: string,
  id: number
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
  id: number
): Promise<void> => {
  await axios({
    method: 'delete',
    url: privateAPI(`orgs/${orgID}/users/${id}`),
  })
}

export const getUsers = async () =>
  (await axios.get(privateAPI('operator/users'))).data.users as User[]
