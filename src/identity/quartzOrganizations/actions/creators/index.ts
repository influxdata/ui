import {OrganizationSummaries} from 'src/client/unityRoutes'
import {RemoteDataState} from 'src/types'

export const SET_QUARTZ_ORGANIZATIONS = 'SET_QUARTZ_ORGANIZATIONS'
export const SET_QUARTZ_ORGANIZATIONS_STATUS = 'SET_QUARTZ_ORGANIZATIONS_STATUS'
export const SET_DEFAULT_ORG = 'SET_DEFAULT_ORG'

export type Actions =
  | ReturnType<typeof setDefaultOrg>
  | ReturnType<typeof setQuartzOrganizations>
  | ReturnType<typeof setQuartzOrganizationsStatus>

export const setQuartzOrganizations = (
  quartzOrganizations: OrganizationSummaries
) =>
  ({
    type: SET_QUARTZ_ORGANIZATIONS,
    quartzOrganizations: quartzOrganizations,
  } as const)

export const setQuartzOrganizationsStatus = (status: RemoteDataState) =>
  ({
    type: SET_QUARTZ_ORGANIZATIONS_STATUS,
    status: status,
  } as const)

export const setDefaultOrg = (
  oldDefaultOrgId: string,
  newDefaultOrgId: string
) =>
  ({
    type: SET_DEFAULT_ORG,
    oldDefaultOrgId: oldDefaultOrgId,
    newDefaultOrgId: newDefaultOrgId,
  } as const)
