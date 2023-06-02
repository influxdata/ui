// Libraries
import {produce} from 'immer'

// Types
import {ActionTypes, Actions} from 'src/overlays/actions/overlays'
import {OverlayParams} from 'src/types'

export type OverlayID =
  | 'add-note'
  | 'edit-note'
  | 'add-master-token'
  | 'access-token'
  | 'access-cloned-token'
  | 'add-custom-token'
  | 'add-token'
  | 'telegraf-config'
  | 'telegraf-output'
  | 'telegraf-instructions'
  | 'telegraf-wizard'
  | 'switch-organizations'
  | 'create-bucket'
  | 'asset-limit'
  | 'cardinality-limit'
  | 'write-limit'
  | 'create-annotation-stream'
  | 'update-annotation-stream'
  | 'add-annotation'
  | 'edit-annotation'
  | 'toggle-auto-refresh'
  | 'cell-copy-overlay'
  | 'bucket-schema-show'
  | 'create-rule'
  | 'create-secret'
  | 'share-overlay'
  | 'contact-support'
  | 'feedback-questions'
  | 'help-bar-confirmation'
  | 'subscription-replace-certificate'
  | 'create-organization'
  | 'marketo-upgrade-account-overlay'
  | 'suspend-org-in-paid-account'
  | 'remove-member'

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
      case ActionTypes.SetOverlayParams: {
        const {overlayParams} = action.payload
        draftState.params = overlayParams
        return
      }
    }
  })

export default overlaysReducer
