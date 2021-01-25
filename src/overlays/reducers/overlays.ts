// Libraries
import {produce} from 'immer'

// Types
import {ActionTypes, Actions} from 'src/overlays/actions/overlays'
import {OverlayParams} from 'src/types'

export type OverlayID =
  | 'add-note'
  | 'edit-note'
  | 'add-master-token'
  | 'add-token'
  | 'telegraf-config'
  | 'telegraf-output'
  | 'switch-organizations'
  | 'create-bucket'
  | 'asset-limit'
  | 'rate-limit'
  | 'create-annotation-stream'
  | 'update-annotation-stream'
  | 'add-annotation'
  | 'edit-annotation'

export interface OverlayState {
  id: OverlayID | null
  params: OverlayParams
  onClose: () => void
}

const nullParams = {}

const defaultState: OverlayState = {
  id: null,
  params: nullParams,
  onClose: () => {},
}

export const overlaysReducer = (
  state = defaultState,
  action: Actions
): OverlayState =>
  produce(state, draftState => {
    switch (action.type) {
      case ActionTypes.ShowOverlay: {
        const {overlayID, overlayParams, onClose} = action.payload
        draftState.id = overlayID
        draftState.params = overlayParams
        draftState.onClose = onClose
        return
      }
      case ActionTypes.DismissOverlay: {
        draftState.id = null
        draftState.params = nullParams
        draftState.onClose = () => {}
        return
      }
    }
  })

export default overlaysReducer
