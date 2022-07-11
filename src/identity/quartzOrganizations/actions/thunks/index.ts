import {Dispatch} from 'react'

// API
import {fetchQuartzOrgs, putDefaultQuartzOrg} from 'src/identity/apis/auth'

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

// Notifications
import {notify} from 'src/shared/actions/notifications'
import {
  accountDefaultSettingSuccess,
  accountDefaultSettingError,
  updateQuartzOrganizationsFailed,
} from 'src/shared/copy/notifications'

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
  oldDefaultOrg: DefaultOrg,
  newDefaultOrg: DefaultOrg
) => async (dispatch: Dispatch<Actions>) => {
  try {
    dispatch(setQuartzOrganizationsStatus(RemoteDataState.Loading))
    await putDefaultQuartzOrg(newDefaultOrg.id)
    dispatch(setQuartzDefaultOrg(oldDefaultOrg.id, newDefaultOrg.id))

    dispatch(setQuartzOrganizationsStatus(RemoteDataState.Done))
    dispatch(notify(accountDefaultSettingSuccess(newDefaultOrg.name)))
  } catch (err) {
    dispatch(setQuartzOrganizationsStatus(RemoteDataState.Error))
    dispatch(notify(accountDefaultSettingError(newDefaultOrg.name)))
  }
}
