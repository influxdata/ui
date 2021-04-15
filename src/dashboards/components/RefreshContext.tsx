import React, {
  createContext,
  useReducer,
  useCallback,
  FC,
  useEffect,
  useMemo,
} from 'react'
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
let timer
const AutoRefreshContextProvider: FC = ({children}) => {
  const [state, dispatch] = useReducer(
    autoRefreshReducer,
    createAutoRefreshInitialState()
  )

  const {currentDashboardId, autoRefresh} = useSelector(
    (appState: AppState) => ({
      autoRefresh: appState.autoRefresh[appState.currentDashboard.id],
      currentDashboardId: appState.currentDashboard.id,
    })
  )

  console.log(autoRefresh)

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

    reduxDispatch(setAutoRefreshDuration(currentDashboardId, state.duration))
  }, [
    currentDashboardId,
    reduxDispatch,
    state.duration,
    state.refreshMilliseconds,
  ])

  const timeout = useMemo(() => {
    const timeoutNumber = parseInt(state.inactivityTimeout)
    const startTime = moment(new Date())
    const copyStart = startTime.unix()
    const endTime = startTime.add(
      timeoutNumber,
      state.inactivityTimeoutCategory[0].toLowerCase()
    )
    const cutoff = endTime.unix() - copyStart

    reduxDispatch(setInactivityTimeout(currentDashboardId, cutoff * 1000))
    return cutoff // Convert to milliseconds
  }, [
    state.inactivityTimeoutCategory,
    state.inactivityTimeout,
    reduxDispatch,
    currentDashboardId,
  ])

  return (
    <AutoRefreshContext.Provider value={{state, dispatch, activateAutoRefresh}}>
      {children}
    </AutoRefreshContext.Provider>
  )
}

export default AutoRefreshContextProvider
