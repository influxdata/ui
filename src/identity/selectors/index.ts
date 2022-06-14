// Types
import {AppState} from 'src/types'
import {CurrentIdentity} from 'src/identity/apis/auth'

export const selectQuartzIdentity = (state: AppState): AppState['identity'] => {
  return state.identity
}

export const getQuartzIdentity = (state: AppState): CurrentIdentity =>
  state.identity
