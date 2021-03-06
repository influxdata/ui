import {DraftInvite, Role} from 'src/types'

export const draftInvite: DraftInvite = {
  email: '',
  role: 'owner' as const,
}

export const roles: Role[] = ['owner']

export const GTM_INVITE_SENT = 'cloudApp_user_invitation_sent'
export const GTM_USER_REMOVED = 'cloudApp_user_removed'
