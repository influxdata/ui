import {AppState, TimeZone, Theme, NavBarState} from 'src/types'

export const timeZone = (state: AppState): TimeZone =>
  state.app.persisted.timeZone || ('Local' as TimeZone)

export const theme = (state: AppState): Theme =>
  state.app.persisted.theme || ('dark' as Theme)

export const navbarMode = (state: AppState): NavBarState =>
  state.app.persisted.navBarState || ('collapsed' as NavBarState)

export const hasUpdatedTimeRangeInVEO = (state: AppState): boolean =>
  state.app.ephemeral.hasUpdatedTimeRangeInVEO || false

export const getPresentationMode = (state: AppState): boolean =>
  state.app.ephemeral.inPresentationMode || false
