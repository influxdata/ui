import {
  DeleteOrgsInviteResult,
  DeleteOrgsUserResult,
  PostOrgsInvitesResendResult,
  Invite,
} from 'src/types'

const makeResponse = (status, data, ...args) => {
  for (let i = 0; i < args.length; i++) {
    console.log(args[i]) // eslint-disable-line no-console
  }

  return Promise.resolve({
    status,
    headers: new Headers({'Content-Type': 'application/json'}),
    data,
  })
}

export const deleteOrgInvite = async (
  orgID: string,
  id: string
): Promise<DeleteOrgsInviteResult> => {
  return makeResponse(204, null, orgID, id)
}

export const resendOrgInvite = async (
  orgID: string,
  id: string,
  invite: Invite // TODO(watts): delete this argument when un-mocking
): Promise<PostOrgsInvitesResendResult> => {
  return makeResponse(200, invite, orgID, id, invite)
}

export const deleteOrgUser = async (
  orgID: string,
  id: string
): Promise<DeleteOrgsUserResult> => {
  return makeResponse(204, null, orgID, id)
}
