// Types
import {AppState} from 'src/types'
import {Me} from 'src/client/unityRoutes'

export const getMe = (state: AppState): AppState['me'] => {
  return state.me
}

export const getQuartzMe = (state: AppState): Me => state.me.quartzMe
