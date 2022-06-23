// Functions calling API
import {
  getAccount,
  getIdentity,
  getMe as getMeQuartz,
  getOrg,
  Account,
  Identity,
  IdentityAccount,
  IdentityUser,
  Me as MeQuartz,
  Organization,
} from 'src/client/unityRoutes'

import {
  getMe as getMeIdpe,
  Error as IdpeError,
  UserResponse as UserResponseIdpe,
} from 'src/client'

// Feature Flag Check
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Constants
import {CLOUD} from 'src/shared/constants'

// Types
import {RemoteDataState} from 'src/types'

// These are optional properties of the current account which are not retrieved from identity.
export interface CurrentAccount extends IdentityAccount {
  billingProvider?: 'zuora' | 'aws' | 'gcm' | 'azure'
}

// Optional properties of the current org, which are not retrieved from identity.
export interface CurrentOrg {
  id: string
  clusterHost: string
  name?: string
  creationDate?: string
  description?: string
  isRegionBeta?: boolean
  provider?: string
  regionCode?: string
  regionName?: string
}

export interface CurrentIdentity {
  user: IdentityUser
  account: CurrentAccount
  org: CurrentOrg
  status?: RemoteDataState
}

// 401 error
export class UnauthorizedError extends Error {
  constructor(message) {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

// 404 error
export class NotFoundError extends Error {
  constructor(message) {
    super(message)
    this.name = 'NotFoundError'
  }
}

// 500 error
export class ServerError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ServerError'
  }
}

export class GenericError extends Error {
  constructor(message) {
    super(message)
    this.name = 'GenericError'
  }
}

export const fetchIdentity = async () => {
  // if we aren't in cloud, or we are in cloud and the unification flag is off
  if (!CLOUD || !isFlagEnabled('uiUnificationFlag')) {
    return fetchLegacyIdentity()
  }
  // if we make it to this line we are in cloud and ui unification flag is on
  if (isFlagEnabled('quartzIdentity')) {
    return fetchQuartzIdentity()
  }

  return fetchQuartzMe()
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

// fetch user identity from /quartz/me.
export const fetchQuartzMe = async (): Promise<MeQuartz> => {
  const response = await getMeQuartz({})

  if (response.status === 401) {
    throw new UnauthorizedError(response.data.message)
  }

  if (response.status === 404) {
    throw new NotFoundError(response.data.message)
  }

  if (response.status === 500) {
    throw new ServerError(response.data.message)
  }

  const user = response.data
  return user
}

// fetch user identity from /me (used in OSS and environments without Quartz)
const fetchLegacyIdentity = async (): Promise<UserResponseIdpe> => {
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

// fetch details about user's current account
export const fetchAccountDetails = async (
  accountId: string | number
): Promise<Account> => {
  const accountIdString = accountId.toString()

  const response = await getAccount({
    accountId: accountIdString,
  })

  if (response.status === 401) {
    throw new UnauthorizedError(response.data.message)
  }

  if (response.status === 500) {
    throw new ServerError(response.data.message)
  }

  const accountDetails = response.data
  return accountDetails
}

// fetch details about user's current organization
export const fetchOrgDetails = async (orgId: string): Promise<Organization> => {
  const response = await getOrg({orgId})

  if (response.status === 401) {
    throw new UnauthorizedError(response.data.message)
  }

  if (response.status === 500) {
    throw new ServerError(response.data.message)
  }

  const orgDetails = response.data
  return orgDetails
}
