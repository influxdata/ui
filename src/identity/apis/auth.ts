// APIs
import {getIdentity, Identity, IdentityUser} from 'src/client/unityRoutes'
import {getMe as getMeIdpe} from 'src/client'

// Constants
import {CLOUD} from 'src/shared/constants'

// Types
import {RemoteDataState} from 'src/types'
import {Error as IdpeError, UserResponse as UserResponseIdpe} from 'src/client'
import {ServerError, UnauthorizedError} from 'src/types/error'
import {CurrentAccount} from 'src/identity/apis/account'
import {
  CurrentOrg,
  OrgCreationAllowances,
  QuartzOrganizations,
} from 'src/identity/apis/org'

export interface IdentityState {
  allowances: {
    orgCreation: OrgCreationAllowances
  }
  currentIdentity: CurrentIdentity
  quartzOrganizations: QuartzOrganizations
}
export interface IdentityLoadingStatus {
  identityStatus: RemoteDataState
  billingStatus: RemoteDataState
  orgDetailsStatus: RemoteDataState
}

export interface CurrentIdentity {
  user: IdentityUser
  account: CurrentAccount
  org: CurrentOrg
  loadingStatus?: IdentityLoadingStatus
}

// fetch the user's identity either using IDPE (in OSS), or quartz (in Cloud)
export const fetchIdentity = async () => {
  if (!CLOUD) {
    return fetchLegacyIdentity()
  }

  return fetchQuartzIdentity()
}

// fetch user identity from /quartz/identity.
export const fetchQuartzIdentity = async (): Promise<Identity> => {
  const response = await getIdentity({})

  if (response.status === 401) {
    throw new UnauthorizedError(response.data.message)
  }

  if (response.status === 500) {
    throw new ServerError(response.data.message)
  }

  const user = response.data
  return user
}

// fetch user identity from IDPE /me (used in OSS and environments without Quartz)
export const fetchLegacyIdentity = async (): Promise<UserResponseIdpe> => {
  const response = await getMeIdpe({})

  if (response.status === 401) {
    throw new UnauthorizedError(response.data.message)
  }

  if (response.status === 500) {
    const error: IdpeError = response.data
    throw new ServerError(error.message)
  }

  const user = response.data
  return user
}
