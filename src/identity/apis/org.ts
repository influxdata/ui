// API Calls
import {
  getAccounts,
  getAccountsOrgs,
  getAllowancesOrgsCreate,
  getClusters,
  getOrg,
  postOrg,
  putAccountsOrgsDefault,
  Organization,
  OrganizationCreateRequest,
} from 'src/client/unityRoutes'

// Types
import {RemoteDataState} from 'src/types'
import {
  GenericError,
  NotFoundError,
  OrgNameConflictError,
  ServerError,
  UnauthorizedError,
  UnprocessableEntityError,
} from 'src/types/error'
import {OrganizationSummaries} from 'src/client/unityRoutes'

export interface CurrentOrg {
  id: string
  clusterHost: string
  name?: string
  creationDate?: string
  description?: string
  provider?: string
  regionCode?: string
  regionName?: string
}

export type QuartzOrganizations = {
  orgs: OrganizationSummaries
  status?: RemoteDataState
}

// create a new organization
export const createNewOrg = async (
  organizationCreateRequest: OrganizationCreateRequest
) => {
  const {orgName, provider, region} = organizationCreateRequest

  const response = await postOrg({
    data: {
      orgName,
      provider,
      region,
    },
  })

  if (response.status === 401) {
    throw new UnauthorizedError(response.data.message)
  }

  if (response.status === 409) {
    throw new OrgNameConflictError(response.data.message)
  }

  if (response.status === 422) {
    throw new UnprocessableEntityError(response.data.message)
  }

  if (response.status === 500) {
    throw new ServerError(response.data.message)
  }

  // Status code in response when successfully creating an org is 201.
  return response.data
}

// fetch the list of clusters in which an org can be created
export const fetchClusterList = async () => {
  const response = await getClusters({})

  if (response.status === 401) {
    throw new UnauthorizedError(response.data.message)
  }

  if (response.status === 500) {
    throw new ServerError(response.data.message)
  }

  return response.data
}

export const fetchDefaultAccountDefaultOrg = async (): Promise<
  OrganizationSummaries[number]
> => {
  const response = await getAccounts({})

  if (response.status === 401) {
    throw new UnauthorizedError(response.data.message)
  }

  if (response.status === 500) {
    throw new ServerError(response.data.message)
  }
  const {data: accounts} = response

  if (Array.isArray(accounts) && accounts.length) {
    // if no default Account, reference the 0-indexed account
    const defaultAccount =
      accounts.find(account => account.isDefault) || accounts[0]
    const quartzOrg = await fetchOrgsByAccountID(defaultAccount.id)

    const defaultQuartzOrg =
      quartzOrg.find(org => org.isDefault) || quartzOrg[0]

    return defaultQuartzOrg
  }
  throw new GenericError('No accounts found')
}

// fetch data regarding whether the user can create new orgs, and associated upgrade options.
export const fetchOrgCreationAllowance = async () => {
  const response = await getAllowancesOrgsCreate({})

  if (response.status !== 200) {
    throw new GenericError(
      'Failed to determine whether this user can create a new organization.'
    )
  }

  return response.data
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
