import {Dispatch} from 'react'

// API
import {fetchQuartzOrgs, putDefaultQuartzOrg} from 'src/identity/apis/auth'

// Actions
import {
  Actions as QuartzOrganizationActions,
  setDefaultOrg,
  setQuartzOrganizations,
  setQuartzOrganizationsStatus,
} from 'src/identity/quartzOrganizations/actions/creators'
import {PublishNotificationAction} from 'src/shared/actions/notifications'

// Types
import {RemoteDataState} from 'src/types'
type Actions = QuartzOrganizationActions | PublishNotificationAction

// Notifications
import {notify} from 'src/shared/actions/notifications'
import {
  updateQuartzOrganizationsFailed,
  accountDefaultSettingSuccess,
  accountDefaultSettingError,
} from 'src/shared/copy/notifications'
import {OrganizationSummaries} from 'src/client/unityRoutes'

export const getQuartzOrganizationsThunk = () => async (
  dispatch: Dispatch<Actions>
) => {
  try {
    dispatch(setQuartzOrganizationsStatus(RemoteDataState.Loading))
    const quartzOrganizations = await fetchQuartzOrgs()

    dispatch(setQuartzOrganizations(quartzOrganizations))
    dispatch(setQuartzOrganizationsStatus(RemoteDataState.Done))
  } catch (error) {
    dispatch(setQuartzOrganizationsStatus(RemoteDataState.Error))
    dispatch(notify(updateQuartzOrganizationsFailed()))
  }
}

export const updateDefaultOrgThunk = (
  oldDefaultOrg: OrganizationSummaries[number],
  newDefaultOrg: OrganizationSummaries[number]
) => async (dispatch: any) => {
  try {
    dispatch(setQuartzOrganizationsStatus(RemoteDataState.Loading))
    await putDefaultQuartzOrg(newDefaultOrg.id)
    dispatch(setDefaultOrg(oldDefaultOrg.id, newDefaultOrg.id))

    dispatch(setQuartzOrganizationsStatus(RemoteDataState.Done))
    dispatch(notify(accountDefaultSettingSuccess(newDefaultOrg.name)))
  } catch (err) {
    dispatch(setQuartzOrganizationsStatus(RemoteDataState.Error))
    dispatch(notify(accountDefaultSettingError(newDefaultOrg.name)))
  }
}
