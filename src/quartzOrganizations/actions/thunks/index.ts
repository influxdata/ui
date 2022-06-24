import {fetchQuartzOrgs} from 'src/identity/apis/auth'

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
