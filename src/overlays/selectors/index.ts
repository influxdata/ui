// Types
import {AppState, OverlayParams} from 'src/types'

export const getOverlayParams = (state: AppState): OverlayParams => {
  return state.overlays?.params
}
