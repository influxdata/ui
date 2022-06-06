// Types
import {AppState} from 'src/types'
import {QuartzIdentity} from 'src/types/quartzIdentity'

export const selectQuartzIdentity = (state: AppState): AppState['identity'] => {
  return state.identity
}

export const getQuartzIdentity = (state: AppState): QuartzIdentity =>
  state.identity
