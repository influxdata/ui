// Functions calling API
import {
  getAccount,
  getAccounts,
  getAccountsOrgs,
  getIdentity,
  getMe as getMeQuartz,
  getOrg,
  putAccountsDefault,
  putAccountsOrgsDefault,
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

// Additional properties of the current account, which are not retrieved from  /quartz/identity.
export interface CurrentAccount extends IdentityAccount {
  billingProvider?: 'zuora' | 'aws' | 'gcm' | 'azure'
}

// Additional properties of the current org, which are not retrieved from /quartz/identity.
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
  UnprocessableEntity = 'UnprocessableEntity',
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

// 422 error
export class UnprocessableEntityError extends Error {
  constructor(message) {
    super(message)
    this.name = 'UnprocessableEntityError'
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
  if (!CLOUD) {
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

// fetch details about one of the user's accounts
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

// change the user's default account
export const updateDefaultQuartzAccount = async (
  accountId: number
): Promise<void> => {
  const response = await putAccountsDefault({
    data: {
      id: accountId,
    },
  })

  if (response.status === 500) {
    throw new ServerError(response.data.message)
  }

  // success status code is 204; no response body expected.
}

// fetch details about one of the user's organizations
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

// fetch the list of organizations associated with a given account ID
export const fetchOrgsByAccountID = async (
  accountNum: number
): Promise<OrganizationSummaries> => {
  const accountId = accountNum.toString()

  const response = await getAccountsOrgs({
    accountId,
  })

  if (response.status === 401) {
    throw new UnauthorizedError(response.data.message)
  }

  if (response.status === 500) {
    throw new ServerError(response.data.message)
  }

  return response.data
}

// update the default org for a given account
export const updateDefaultOrgByAccountID = async ({
  accountNum,
  orgId,
}): Promise<void> => {
  const accountId = accountNum.toString()

  const response = await putAccountsOrgsDefault({
    accountId,
    data: {
      id: orgId,
    },
  })

  if (response.status === 404) {
    throw new NotFoundError(response.data.message)
  }

  if (response.status === 422) {
    throw new UnprocessableEntityError(response.data.message)
  }

  if (response.status === 500) {
    throw new ServerError(response.data.message)
  }

  // success status code is 204; no response body expected.
}

// fetch user default account's default org
export const getDefaultAccountDefaultOrg = async (): Promise<OrganizationSummaries[number]> => {
  const response = await getAccounts({})

  if (response.status === 401) {
    throw new UnauthorizedError(response.data.message)
  }

  if (response.status === 500) {
    throw new ServerError(response.data.message)
  }
  const {data} = response

  if (Array.isArray(data) && data.length) {
    const defaultAccount = data.find(account => account.isDefault)

    // fetch default org
    if (defaultAccount) {
      const quartzOrg = await fetchOrgsByAccountID(defaultAccount.id)
      const defaultQuartzOrg =
        quartzOrg.find(org => org.isDefault) || quartzOrg[0]

      return defaultQuartzOrg
    }
    throw new GenericError('No default account found')
  }
}
