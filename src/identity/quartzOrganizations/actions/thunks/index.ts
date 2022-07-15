import {Dispatch} from 'react'

// API
import {fetchQuartzOrgs, updateDefaultQuartzOrg} from 'src/identity/apis/auth'

// Actions
import {
  Actions as QuartzOrganizationActions,
  setQuartzDefaultOrg,
  setQuartzOrganizations,
  setQuartzOrganizationsStatus,
} from 'src/identity/quartzOrganizations/actions/creators'
import {PublishNotificationAction} from 'src/shared/actions/notifications'

// Types
import {RemoteDataState} from 'src/types'
import {OrganizationSummaries} from 'src/client/unityRoutes'

type Actions = QuartzOrganizationActions | PublishNotificationAction
type DefaultOrg = OrganizationSummaries[number]

// Error Reporting
import {reportErrorThroughHoneyBadger} from 'src/shared/utils/errors'

export const getQuartzOrganizationsThunk = () => async (
  dispatch: Dispatch<Actions>
) => {
  try {
    dispatch(setQuartzOrganizationsStatus(RemoteDataState.Loading))
    const quartzOrganizations = await fetchQuartzOrgs()

    dispatch(setQuartzOrganizations(quartzOrganizations))
    dispatch(setQuartzOrganizationsStatus(RemoteDataState.Done))
  } catch (err) {
    dispatch(setQuartzOrganizationsStatus(RemoteDataState.Error))

    reportErrorThroughHoneyBadger(err, {
      name: 'Failed to fetch /quartz/orgs/',
    })
  }
}

export const updateDefaultOrgThunk = (
  oldDefaultOrg: DefaultOrg,
  newDefaultOrg: DefaultOrg
) => async (dispatch: Dispatch<Actions>) => {
  try {
    dispatch(setQuartzOrganizationsStatus(RemoteDataState.Loading))

    await updateDefaultQuartzOrg(newDefaultOrg.id)

    dispatch(setQuartzDefaultOrg(oldDefaultOrg.id, newDefaultOrg.id))

    dispatch(setQuartzOrganizationsStatus(RemoteDataState.Done))
  } catch (err) {
    dispatch(setQuartzOrganizationsStatus(RemoteDataState.Error))

    reportErrorThroughHoneyBadger(err, {
      name: 'Failed to update /quartz/orgs/default',
    })
  }
}
