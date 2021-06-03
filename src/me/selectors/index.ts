// Types
import {AppState, Me} from 'src/types'

export const getMe = (state: AppState): AppState['me'] => {
  return state.me
}

export const getQuartzMe = (state: AppState): Me => state.me.quartzMe
