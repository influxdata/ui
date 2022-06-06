// Types
import {AppState} from 'src/types'
import {QuartzIdentityState} from 'src/identity/reducers'

export const selectQuartzIdentity = (state: AppState): AppState['identity'] => {
  return state.identity
}

export const getQuartzIdentity = (state: AppState): QuartzIdentityState =>
  state.identity
