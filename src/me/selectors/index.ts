// Types
import {AppState} from 'src/types'

export const getMe = (state: AppState): AppState['me'] => {
  return state.me
}
