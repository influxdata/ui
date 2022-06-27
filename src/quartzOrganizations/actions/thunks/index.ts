import {fetchQuartzOrgs} from 'src/identity/apis/auth'
import {setQuartzOrganizations, setQuartzOrganizationsStatus} from '../creators'
import {RemoteDataState} from 'src/types'
import {notify} from 'src/shared/actions/notifications'
import {updateQuartzOrganizationsFailed} from 'src/shared/copy/notifications'

export const getQuartzOrganizationsThunk = () => async dispatch => {
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
