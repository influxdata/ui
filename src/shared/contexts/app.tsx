import React, {FC, useCallback} from 'react'
import {useSelector, useDispatch} from 'react-redux'

import {
  setTimeZone as setTimeZoneAction,
  setTheme as setThemeAction,
  setNavBarState as setNavbarModeAction,
  setFluxQueryBuilder as setFluxQueryBuilderAction,
  enablePresentationMode,
  disablePresentationMode,
  setFlowsCTA as setFlowsCTAAction,
} from 'src/shared/actions/app'
import {
  timeZone as timeZoneFromState,
  theme as themeFromState,
  getPresentationMode as presentationModeFromState,
  fluxQueryBuilder as fluxQueryBuilderFromState,
  navbarMode as navbarModeFromState,
  getFlowsCTA,
} from 'src/shared/selectors/app'
import {notify} from 'src/shared/actions/notifications'
import {PRESENTATION_MODE_ANIMATION_DELAY} from 'src/shared/constants'
import {presentationMode as presentationModeCopy} from 'src/shared/copy/notifications'

import {AppState, TimeZone, Theme, NavBarState, FlowsCTA} from 'src/types'

interface AppSettingContextType {
  timeZone: TimeZone
  theme: Theme
  presentationMode: boolean
  fluxQueryBuilder: boolean
  navbarMode: NavBarState
  flowsCTA: FlowsCTA

  setTimeZone: (zone: TimeZone) => void
  setTheme: (theme: Theme) => void
  setPresentationMode: (active: boolean) => void
  setFluxQueryBuilder: (active: boolean) => void
  setNavbarMode: (mode: NavBarState) => void
  setFlowsCTA: (flowsCTA: FlowsCTA) => void
}

const DEFAULT_CONTEXT: AppSettingContextType = {
  timeZone: 'Local' as TimeZone,
  theme: 'dark' as Theme,
  presentationMode: false,
  fluxQueryBuilder: false,
  navbarMode: 'collapsed' as NavBarState,
  flowsCTA: {alerts: true, explorer: true, tasks: true} as FlowsCTA,

  setTimeZone: (_zone: TimeZone) => {},
  setTheme: (_theme: Theme) => {},
  setPresentationMode: (_active: boolean) => {},
  setFluxQueryBuilder: (_active: boolean) => {},
  setNavbarMode: (_mode: NavBarState) => {},
  setFlowsCTA: (_flowsCTA: FlowsCTA) => {},
}

export const AppSettingContext = React.createContext<AppSettingContextType>(
  DEFAULT_CONTEXT
)

export const AppSettingProvider: FC = ({children}) => {
  const {
    timeZone,
    theme,
    presentationMode,
    fluxQueryBuilder,
    navbarMode,
    flowsCTA,
  } = useSelector((state: AppState) => ({
    timeZone: timeZoneFromState(state),
    theme: themeFromState(state),
    presentationMode: presentationModeFromState(state),
    fluxQueryBuilder: fluxQueryBuilderFromState(state),
    navbarMode: navbarModeFromState(state),
    flowsCTA: getFlowsCTA(state),
  }))
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
  const setPresentationMode = useCallback(
    (_active: boolean) => {
      if (_active) {
        setTimeout(() => {
          dispatch(enablePresentationMode())
          dispatch(notify(presentationModeCopy()))
        }, PRESENTATION_MODE_ANIMATION_DELAY)
      } else {
        dispatch(disablePresentationMode())
      }
    },
    [dispatch]
  )
  const setFluxQueryBuilder = useCallback(
    (_active: boolean) => {
      dispatch(setFluxQueryBuilderAction(_active))
    },
    [dispatch]
  )
  const setNavbarMode = useCallback(
    (_mode: NavBarState) => {
      dispatch(setNavbarModeAction(_mode))
    },
    [dispatch]
  )
  const setFlowsCTA = useCallback(
    (_flowsCTA: FlowsCTA) => {
      dispatch(setFlowsCTAAction(_flowsCTA))
    },
    [dispatch]
  )

  return (
    <AppSettingContext.Provider
      value={{
        timeZone,
        theme,
        presentationMode,
        fluxQueryBuilder,
        navbarMode,
        flowsCTA,

        setTimeZone,
        setTheme,
        setPresentationMode,
        setFluxQueryBuilder,
        setNavbarMode,
        setFlowsCTA,
      }}
    >
      {children}
    </AppSettingContext.Provider>
  )
}
