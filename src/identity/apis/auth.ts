// Functions calling API
import {
  getAccount,
  getIdentity,
  getMe as getMeQuartz,
  getOrg,
  getOrgs,
  putOrgsDefault,
  Account,
  Identity,
  IdentityAccount,
  IdentityUser,
  Me as MeQuartz,
  Organization,
  OrganizationSummaries,
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

export interface IdentityState {
  currentIdentity: CurrentIdentity
  quartzOrganizations: QuartzOrganizations
}

export type QuartzOrganizations = {
  orgs: OrganizationSummaries
  status?: RemoteDataState
}

export interface CurrentIdentity {
  user: IdentityUser
  account: CurrentAccount
  org: CurrentOrg
  status?: RemoteDataState
}

export enum NetworkErrorTypes {
  UnauthorizedError = 'UnauthorizedError',
  NotFoundError = 'NotFoundError',
  ServerError = 'ServerError',
  GenericError = 'GenericError',
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

const identityRetryDelay = 30000 // 30 seconds
const retryLimit = 5

export const retryFetchIdentity = async (
  retryAttempts = 1,
  retryDelay = identityRetryDelay
) => {
  try {
    return await fetchIdentity()
  } catch (error) {
    if (
      error.name === NetworkErrorTypes.UnauthorizedError ||
      error.name === NetworkErrorTypes.GenericError
    ) {
      throw error
    }

    if (error.name === NetworkErrorTypes.ServerError) {
      if (retryAttempts >= retryLimit) {
        throw error
      }
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          retryFetchIdentity(retryAttempts + 1, retryDelay)
            .then(user => {
              resolve(user)
            })
            .catch(error => {
              reject(error)
            })
        }, retryAttempts * retryDelay)
      })
    }
  }
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

// fetch list of user's current organizations
export const fetchQuartzOrgs = async (): Promise<OrganizationSummaries> => {
  const response = await getOrgs({})

  if (response.status === 401) {
    throw new UnauthorizedError(response.data.message)
  }

  if (response.status === 500) {
    throw new ServerError(response.data.message)
  }

  return response.data
}

// change default organization for a given account
export const putDefaultQuartzOrg = async (orgId: string) => {
  const response = await putOrgsDefault({
    data: {
      id: orgId,
    },
  })

  // Only status codes thrown at moment are 204 and 5xx.
  if (response.status !== 204) {
    throw new ServerError(response.data.message)
  }

  return response.data
}
