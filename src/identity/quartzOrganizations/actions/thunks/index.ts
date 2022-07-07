import {Dispatch} from 'react'

// API
import {fetchQuartzOrgs} from 'src/identity/apis/auth'

// Actions
import {
  Actions as QuartzOrganizationActions,
  setQuartzOrganizations,
  setQuartzOrganizationsStatus,
} from 'src/identity/quartzOrganizations/actions/creators'
import {PublishNotificationAction} from 'src/shared/actions/notifications'

// Types
import {RemoteDataState} from 'src/types'
type Actions = QuartzOrganizationActions | PublishNotificationAction

// Notifications
import {notify} from 'src/shared/actions/notifications'
import {updateQuartzOrganizationsFailed} from 'src/shared/copy/notifications'

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
