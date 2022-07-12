// Types
import {AppState} from 'src/types'

export const selectQuartzIdentity = (state: AppState): AppState['identity'] => {
  return state.identity
}

export const selectQuartzOrgs = (
  state: AppState
): AppState['identity']['quartzOrganizations'] => {
  return state.identity.quartzOrganizations
}
