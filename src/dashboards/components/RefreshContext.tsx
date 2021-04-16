import React, {createContext, useReducer, useCallback, FC} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import moment from 'moment'

// Types
import {
  CustomTimeRange,
  AutoRefreshStatus,
  AutoRefresh,
  AppState,
} from 'src/types'

// Actions
import {
  setAutoRefreshInterval,
  setAutoRefreshStatus,
  setAutoRefreshDuration,
  setInactivityTimeout,
} from 'src/shared/actions/autoRefresh'

export const AutoRefreshContext = createContext(null)

interface AutoRefreshState {
  duration: CustomTimeRange
  inactivityTimeout: string
  inactivityTimeoutCategory: string
  refreshMilliseconds: AutoRefresh
}

const calculateTimeout = (timeout, timeoutUnit) => {
  const timeoutNumber = parseInt(timeout)
  const startTime = moment(new Date())
  const copyStart = startTime.unix()
  const endTime = startTime.add(timeoutNumber, timeoutUnit[0].toLowerCase())
  const cutoff = endTime.unix() - copyStart
  return cutoff * 1000
}

export const createAutoRefreshInitialState = (
  override = {}
): AutoRefreshState => {
  return {
    inactivityTimeout: 'None',
    inactivityTimeoutCategory: 'Hours',
    duration: {
      lower: new Date().toISOString(),
      upper: new Date().toISOString(),
      type: 'custom',
    } as CustomTimeRange,
    refreshMilliseconds: {
      interval: 0,
      status: AutoRefreshStatus.Paused,
    },
    ...override,
  }
}

const autoRefreshReducer = (
  state = createAutoRefreshInitialState(),
  action
) => {
  switch (action.type) {
    case 'SET_DURATION':
      return {...state, duration: action.duration}
    case 'SET_INACTIVITY_TIMEOUT':
      return {...state, inactivityTimeout: action.inactivityTimeout}
    case 'SET_INACTIVITY_TIMEOUT_CATEGORY':
      return {
        ...state,
        inactivityTimeoutCategory: action.inactivityTimeoutCategory,
      }
    case 'SET_REFRESH_MILLISECONDS':
      return {...state, refreshMilliseconds: action.refreshMilliseconds}
    case 'RESET':
      return createAutoRefreshInitialState()
    default:
      return state
  }
}

const AutoRefreshContextProvider: FC = ({children}) => {
  const [state, dispatch] = useReducer(
    autoRefreshReducer,
    createAutoRefreshInitialState()
  )

  const {currentDashboardId} = useSelector((appState: AppState) => ({
    currentDashboardId: appState.currentDashboard.id,
  }))

  const reduxDispatch = useDispatch()

  const activateAutoRefresh = useCallback(() => {
    reduxDispatch(
      setAutoRefreshInterval(
        currentDashboardId,
        state.refreshMilliseconds.interval
      )
    )

    if (state.refreshMilliseconds.interval === 0) {
      reduxDispatch(
        setAutoRefreshStatus(currentDashboardId, AutoRefreshStatus.Paused)
      )
      return
    }

    reduxDispatch(
      setAutoRefreshStatus(currentDashboardId, AutoRefreshStatus.Active)
    )

    if (state.inactivityTimeout !== 'None') {
      const cutoff = calculateTimeout(
        state.inactivityTimeout,
        state.inactivityTimeoutCategory
      )
      reduxDispatch(setInactivityTimeout(currentDashboardId, cutoff))
    }

    reduxDispatch(setAutoRefreshDuration(currentDashboardId, state.duration))
  }, [
    currentDashboardId,
    reduxDispatch,
    state.duration,
    state.refreshMilliseconds,
    state.inactivityTimeout,
    state.inactivityTimeoutCategory,
  ])

  return (
    <AutoRefreshContext.Provider value={{state, dispatch, activateAutoRefresh}}>
      {children}
    </AutoRefreshContext.Provider>
  )
}

export default AutoRefreshContextProvider
