import React, {FC, useCallback} from 'react'
import {useSelector, useDispatch} from 'react-redux'

import {
  setTimeZone as setTimeZoneAction,
  setTheme as setThemeAction,
  setNavBarState as setNavbarModeAction,
} from 'src/shared/actions/app'
import {
  timeZone as timeZoneFromState,
  theme as themeFromState,
  getPresentationMode as presentationModeFromState,
  navbarMode as navbarModeFromState,
} from 'src/shared/selectors/app'

import {AppState, TimeZone, Theme, NavBarState} from 'src/types'

interface AppSettingContextType {
  timeZone: TimeZone
  theme: Theme
  presentationMode: boolean
  navbarMode: NavBarState

  setTimeZone: (zone: TimeZone) => void
  setTheme: (theme: Theme) => void
  setNavbarMode: (mode: NavBarState) => void
}

const DEFAULT_CONTEXT: AppSettingContextType = {
  timeZone: 'Local' as TimeZone,
  theme: 'dark' as Theme,
  presentationMode: false,
  navbarMode: 'collapsed' as NavBarState,

  setTimeZone: (_zone: TimeZone) => {},
  setTheme: (_theme: Theme) => {},
  setNavbarMode: (_mode: NavBarState) => {},
}

export const AppSettingContext = React.createContext<AppSettingContextType>(
  DEFAULT_CONTEXT
)

export const AppSettingProvider: FC = ({children}) => {
  const {timeZone, theme, presentationMode, navbarMode} = useSelector(
    (state: AppState) => ({
      timeZone: timeZoneFromState(state),
      theme: themeFromState(state),
      presentationMode: presentationModeFromState(state),
      navbarMode: navbarModeFromState(state),
    })
  )
  const dispatch = useDispatch()

  const setTimeZone = useCallback(
    (_timeZone: TimeZone) => {
      dispatch(setTimeZoneAction(_timeZone))
    },
    [dispatch]
  )
  const setTheme = useCallback(
    (_theme: Theme) => {
      dispatch(setThemeAction(_theme))
    },
    [dispatch]
  )
  const setNavbarMode = useCallback(
    (_mode: NavBarState) => {
      dispatch(setNavbarModeAction(_mode))
    },
    [dispatch]
  )

  return (
    <AppSettingContext.Provider
      value={{
        timeZone,
        theme,
        presentationMode,
        navbarMode,

        setTimeZone,
        setTheme,
        setNavbarMode,
      }}
    >
      {children}
    </AppSettingContext.Provider>
  )
}
