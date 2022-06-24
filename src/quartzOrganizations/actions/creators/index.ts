import {OrganizationSummaries} from '../../../client/unityRoutes'
import {RemoteDataState} from '../../../types'

export const SET_QUARTZ_ORGANIZATIONS = 'SET_QUARTZ_ORGANIZATIONS'
export const SET_QUARTZ_ORGANIZATIONS_STATUS = 'SET_QUARTZ_ORGANIZATIONS_STATUS'

export type Actions =
  | ReturnType<typeof setQuartzOrganizations>
  | ReturnType<typeof setQuartzOrganizationsStatus>

export const setQuartzOrganizations = (
  quartzOrganizations: OrganizationSummaries
) =>
  ({
    type: SET_QUARTZ_ORGANIZATIONS,
    quartzOrganizations: quartzOrganizations,
  } as const)

export const setQuartzOrganizationsStatus = (status: RemoteDataState) => ({
  type: SET_QUARTZ_ORGANIZATIONS_STATUS,
  status: status,
} as const)
