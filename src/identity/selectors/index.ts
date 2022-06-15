// Types
import {AppState} from 'src/types'

export const selectQuartzIdentity = (state: AppState): AppState['identity'] => {
  return state.identity
}
