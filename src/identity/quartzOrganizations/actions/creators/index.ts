import {OrganizationSummaries} from 'src/client/unityRoutes'
import {RemoteDataState} from 'src/types'

export const SET_QUARTZ_ORGANIZATIONS = 'SET_QUARTZ_ORGANIZATIONS'
export const SET_QUARTZ_ORGANIZATIONS_STATUS = 'SET_QUARTZ_ORGANIZATIONS_STATUS'
export const SET_QUARTZ_DEFAULT_ORG = 'SET_QUARTZ_DEFAULT_ORG'

export type Actions =
  | ReturnType<typeof setQuartzDefaultOrg>
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

export const setQuartzDefaultOrg = (newDefaultOrgId: string) =>
  ({
    type: SET_QUARTZ_DEFAULT_ORG,
    newDefaultOrgId: newDefaultOrgId,
  } as const)
