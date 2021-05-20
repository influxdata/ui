import {Invite as GenInvite} from 'src/client/unityRoutes'
export {User as CloudUser, Invite} from 'src/client/unityRoutes'

export type Role = 'owner' | 'member'

export type DraftInvite = Omit<GenInvite, 'id' | 'status' | 'expiresAt'>
