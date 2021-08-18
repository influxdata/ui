import {OverlayID} from 'src/overlays/reducers/overlays'
import {OverlayParams} from 'src/types'

export enum ActionTypes {
  ShowOverlay = 'SHOW_OVERLAY',
  DismissOverlay = 'DISMISS_OVERLAY',
  SetOverlayParams = 'SET_OVERLAY_PARAMS',
}

export type Actions = ShowOverlay | DismissOverlay | SetOverlayParams

export interface ShowOverlay {
  type: ActionTypes.ShowOverlay
  payload: {
    overlayID: OverlayID
    overlayParams: OverlayParams
    onClose: () => void
  }
}

export const showOverlay = (
  overlayID: OverlayID,
  overlayParams: OverlayParams,
  onClose: () => void
): ShowOverlay => {
  return {
    type: ActionTypes.ShowOverlay,
    payload: {overlayID, overlayParams, onClose},
  }
}

export interface DismissOverlay {
  type: ActionTypes.DismissOverlay
}

export const dismissOverlay = (): DismissOverlay => {
  return {
    type: ActionTypes.DismissOverlay,
  }
}

export interface SetOverlayParams {
  type: ActionTypes.SetOverlayParams
  payload: {
    overlayParams: OverlayParams
  }
}

export const setOverlayParams = (
  overlayParams: OverlayParams
): SetOverlayParams => {
  return {
    type: ActionTypes.SetOverlayParams,
    payload: {overlayParams},
  }
}
