// Constants
import {
  CANCEL_BTN_DELAY,
  PRESENTATION_MODE_ANIMATION_DELAY, // NOTE: this needs to be imported at the top of the file otherwise the app doesn't compile properly due to a race condition
} from 'src/shared/constants'

// Utils
import {
  notify,
  PublishNotificationAction,
} from 'src/shared/actions/notifications'
import {presentationMode} from 'src/shared/copy/notifications'

// Types
import {Dispatch} from 'redux'
import {TimeZone, Theme, NavBarState, NotebookMiniMapState} from 'src/types'

export enum ActionTypes {
  EnablePresentationMode = 'ENABLE_PRESENTATION_MODE',
  DisablePresentationMode = 'DISABLE_PRESENTATION_MODE',
  EnableUpdatedTimeRangeInVEO = 'ENABLE_UPDATED_TIMERANGE_IN_VEO',
  DisableUpdatedTimeRangeInVEO = 'DISABLE_UPDATED_TIMERANGE_IN_VEO',
  EnableCancelBtn = 'ENABLE_CANCEL_BTN',
  DisableCancelBtn = 'DISABLE_CANCEL_BTN',
  SetNavBarState = 'SET_NAV_BAR_STATE',
  SetNotebookMiniMapState = 'SET_NOTEBOOK_MINI_MAP_STATE',
  SetAutoRefresh = 'SET_AUTOREFRESH',
  SetTimeZone = 'SET_APP_TIME_ZONE',
  TemplateControlBarVisibilityToggled = 'TemplateControlBarVisibilityToggledAction',
  Noop = 'NOOP',
}

export type Action =
  | ReturnType<typeof enablePresentationMode>
  | ReturnType<typeof disablePresentationMode>
  | ReturnType<typeof enableUpdatedTimeRangeInVEO>
  | ReturnType<typeof disableUpdatedTimeRangeInVEO>
  | ReturnType<typeof enableCancelBtn>
  | ReturnType<typeof disableCancelBtn>
  | ReturnType<typeof setNavBarState>
  | ReturnType<typeof setNotebookMiniMapState>
  | ReturnType<typeof setAutoRefresh>
  | ReturnType<typeof setTimeZone>
  | ReturnType<typeof setTheme>

// ephemeral state action creators

export const enablePresentationMode = () =>
  ({
    type: ActionTypes.EnablePresentationMode,
  } as const)

export const disablePresentationMode = () =>
  ({
    type: ActionTypes.DisablePresentationMode,
  } as const)

export const enableUpdatedTimeRangeInVEO = () =>
  ({
    type: ActionTypes.EnableUpdatedTimeRangeInVEO,
  } as const)

export const disableUpdatedTimeRangeInVEO = () =>
  ({
    type: ActionTypes.DisableUpdatedTimeRangeInVEO,
  } as const)

export const enableCancelBtn = () =>
  ({
    type: ActionTypes.EnableCancelBtn,
  } as const)

export const disableCancelBtn = () =>
  ({
    type: ActionTypes.DisableCancelBtn,
  } as const)

export const delayEnablePresentationMode = () => (
  dispatch: Dispatch<
    ReturnType<typeof enablePresentationMode> | PublishNotificationAction
  >
): NodeJS.Timer =>
  setTimeout(() => {
    dispatch(enablePresentationMode())
    dispatch(notify(presentationMode()))
  }, PRESENTATION_MODE_ANIMATION_DELAY)

export const delayEnableCancelBtn = () => (
  dispatch: Dispatch<ReturnType<typeof enableCancelBtn>>
): NodeJS.Timer =>
  setTimeout(() => {
    dispatch(enableCancelBtn())
  }, CANCEL_BTN_DELAY)

// persistent state action creators

export const setTheme = (theme: Theme) => ({type: 'SET_THEME', theme} as const)

export const setNavBarState = (navBarState: NavBarState) =>
  ({
    type: ActionTypes.SetNavBarState,
    navBarState,
  } as const)

export const setNotebookMiniMapState = (
  notebookMiniMapState: NotebookMiniMapState
) =>
  ({
    type: ActionTypes.SetNotebookMiniMapState,
    notebookMiniMapState,
  } as const)

export const setAutoRefresh = (milliseconds: number) =>
  ({
    type: ActionTypes.SetAutoRefresh,
    payload: {
      milliseconds,
    },
  } as const)

export const setTimeZone = (timeZone: TimeZone) =>
  ({
    type: ActionTypes.SetTimeZone,
    payload: {timeZone},
  } as const)
