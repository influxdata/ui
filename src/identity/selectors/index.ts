// Types
import {AppState} from 'src/types'
import {RemoteDataState} from '@influxdata/clockface'

export const selectQuartzIdentity = (state: AppState): AppState['identity'] => {
  return state.identity
}

export const selectCurrentIdentity = (
  state: AppState
): AppState['identity']['currentIdentity'] => {
  return state.identity.currentIdentity
}

export const selectQuartzIdentityStatus = (state: AppState): RemoteDataState =>
  state.identity.currentIdentity.status

export const selectQuartzOrgs = (
  state: AppState
): AppState['identity']['quartzOrganizations'] => {
  return state.identity.quartzOrganizations
}
