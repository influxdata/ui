import {OrganizationSummaries} from '../../../client/unityRoutes'

export const SET_QUARTZ_ORGANIZATIONS = 'SET_QUARTZ_ORGANIZATIONS'

export type Actions = ReturnType<typeof setQuartzOrganizations>

export const setQuartzOrganizations = (
  quartzOrganizations: OrganizationSummaries
) =>
  ({
    type: SET_QUARTZ_ORGANIZATIONS,
    quartzOrganizations: quartzOrganizations,
  } as const)
