import React, {FC, useCallback} from 'react'
import {useSelector, useDispatch} from 'react-redux'

import {
  setTimeZone as setTimeZoneAction,
  setTheme as setThemeAction,
  setNavBarState as setNavbarModeAction,
  setFluxQueryBuilder as setFluxQueryBuilderAction,
  setNewTasksUI as setNewTasksUIAction,
  enablePresentationMode,
  disablePresentationMode,
  setFlowsCTA as setFlowsCTAAction,
  setSubscriptionsCertificateInterest as setSubscriptionsCertificateInterestAction,
} from 'src/shared/actions/app'
import {
  timeZone as timeZoneFromState,
  theme as themeFromState,
  getPresentationMode as presentationModeFromState,
  fluxQueryBuilder as fluxQueryBuilderFromState,
  navbarMode as navbarModeFromState,
  newTasksUI as newTasksUIFromState,
  getFlowsCTA,
  getSubscriptionsCertificateInterest,
} from 'src/shared/selectors/app'
import {notify} from 'src/shared/actions/notifications'
import {PRESENTATION_MODE_ANIMATION_DELAY} from 'src/shared/constants'
import {presentationMode as presentationModeCopy} from 'src/shared/copy/notifications'

import {AppState, TimeZone, Theme, NavBarState, FlowsCTA} from 'src/types'
import {event} from 'src/cloud/utils/reporting'

interface AppSettingContextType {
  timeZone: TimeZone
  theme: Theme
  presentationMode: boolean
  fluxQueryBuilder: boolean
  newTasksUI: boolean
  navbarMode: NavBarState
  flowsCTA: FlowsCTA
  subscriptionsCertificateInterest: boolean

  setTimeZone: (zone: TimeZone) => void
  setTheme: (theme: Theme) => void
  setPresentationMode: (active: boolean) => void
  setFluxQueryBuilder: (active: boolean) => void
  setNewTasksUI: (active: boolean) => void
  setNavbarMode: (mode: NavBarState) => void
  setFlowsCTA: (flowsCTA: FlowsCTA) => void
  setSubscriptionsCertificateInterest: () => void
}

const DEFAULT_CONTEXT: AppSettingContextType = {
  timeZone: 'Local' as TimeZone,
  theme: 'dark' as Theme,
  presentationMode: false,
  fluxQueryBuilder: false,
  newTasksUI: true,
  navbarMode: 'collapsed' as NavBarState,
  flowsCTA: {alerts: true, explorer: true, tasks: true} as FlowsCTA,
  subscriptionsCertificateInterest: false,

  setTimeZone: (_zone: TimeZone) => {},
  setTheme: (_theme: Theme) => {},
  setPresentationMode: (_active: boolean) => {},
  setFluxQueryBuilder: (_active: boolean) => {},
  setNewTasksUI: (_active: boolean) => {},
  setNavbarMode: (_mode: NavBarState) => {},
  setFlowsCTA: (_flowsCTA: FlowsCTA) => {},
  setSubscriptionsCertificateInterest: () => {},
}

export const AppSettingContext =
  React.createContext<AppSettingContextType>(DEFAULT_CONTEXT)

export const AppSettingProvider: FC = ({children}) => {
  const {
    timeZone,
    theme,
    presentationMode,
    fluxQueryBuilder,
    newTasksUI,
    navbarMode,
    flowsCTA,
    subscriptionsCertificateInterest,
  } = useSelector((state: AppState) => ({
    timeZone: timeZoneFromState(state),
    theme: themeFromState(state),
    presentationMode: presentationModeFromState(state),
    fluxQueryBuilder: fluxQueryBuilderFromState(state),
    newTasksUI: newTasksUIFromState(state),
    navbarMode: navbarModeFromState(state),
    flowsCTA: getFlowsCTA(state),
    subscriptionsCertificateInterest:
      getSubscriptionsCertificateInterest(state),
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
  const setNewTasksUI = useCallback(
    (_active: boolean) => {
      dispatch(setNewTasksUIAction(_active))
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
  const setSubscriptionsCertificateInterest = useCallback(() => {
    event('certificate auth interest', {}, {feature: 'subscriptions'})
    dispatch(setSubscriptionsCertificateInterestAction())
  }, [dispatch])

  return (
    <AppSettingContext.Provider
      value={{
        timeZone,
        theme,
        presentationMode,
        fluxQueryBuilder,
        newTasksUI,
        navbarMode,
        flowsCTA,
        subscriptionsCertificateInterest,

        setTimeZone,
        setTheme,
        setPresentationMode,
        setFluxQueryBuilder,
        setNewTasksUI,
        setNavbarMode,
        setFlowsCTA,
        setSubscriptionsCertificateInterest,
      }}
    >
      {children}
    </AppSettingContext.Provider>
  )
}
