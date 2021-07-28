import React, {createContext, useReducer, useCallback, FC} from 'react'
import {useSelector, useDispatch} from 'react-redux'

// Types
import {CustomTimeRange, AutoRefreshStatus} from 'src/types'

// Actions
import {
  setAutoRefreshDuration,
  setInactivityTimeout,
  setAutoRefreshInterval,
  setAutoRefreshStatus,
} from 'src/shared/actions/autoRefresh'
import {getCurrentDashboardId} from 'src/dashboards/selectors'

// Utils
import {createDateTimeFormatter} from 'src/utils/datetime/formatters'
import {addDurationToDate} from 'src/shared/utils/dateTimeUtils'

export const AutoRefreshContext = createContext(null)

// default time increment is 1 hour
const oneHourInTheFuture = 1

export interface AutoRefreshState {
  duration: CustomTimeRange
  inactivityTimeout: string
  inactivityTimeoutCategory: string
  refreshMilliseconds: {
    status: AutoRefreshStatus
    interval: number
    label: string
  }
  infiniteDuration: boolean
}

const jumpAheadTime = () => {
  const newTime = addDurationToDate(new Date(), oneHourInTheFuture, 'h')

  const formatter = createDateTimeFormatter('YYYY-MM-DD HH:mm:ss')
  return formatter.format(newTime)
}

const calculateTimeout = (timeout: string, timeoutUnit: string) => {
  const timeoutNumber = parseInt(timeout, 10)
  const startTime = new Date()
  const copyStart = startTime.getTime()
  const endTime = addDurationToDate(
    startTime,
    timeoutNumber,
    timeoutUnit[0].toLowerCase()
  )
  const cutoff = endTime.getTime() - copyStart

  return cutoff
}

export const createAutoRefreshInitialState = (
  override = {}
): AutoRefreshState => {
  return {
    inactivityTimeout: '1',
    inactivityTimeoutCategory: 'Hours',
    duration: {
      lower: new Date().toISOString(),
      upper: jumpAheadTime(),
      type: 'custom',
    },
    refreshMilliseconds: {
      interval: 60000,
      status: AutoRefreshStatus.Active,
      label: '60s',
    },
    infiniteDuration: false,
    ...override,
  }
}

const autoRefreshReducer = (
  state = createAutoRefreshInitialState(),
  action
) => {
  switch (action.type) {
    case 'SET_REFRESH_MILLISECONDS':
      return {...state, refreshMilliseconds: action.refreshMilliseconds}
    case 'SET_DURATION':
      return {...state, duration: action.duration}
    case 'SET_INACTIVITY_TIMEOUT':
      return {...state, inactivityTimeout: action.inactivityTimeout}
    case 'SET_INACTIVITY_TIMEOUT_CATEGORY':
      return {
        ...state,
        inactivityTimeoutCategory: action.inactivityTimeoutCategory,
      }
    case 'SET_INFINITE_DURATION':
      return {...state, infiniteDuration: action.infiniteDuration}
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

  const currentDashboardId = useSelector(getCurrentDashboardId)

  const reduxDispatch = useDispatch()

  const setAutoRefreshSettings = useCallback(() => {
    reduxDispatch(
      setAutoRefreshInterval(
        currentDashboardId,
        state.refreshMilliseconds.interval,
        state.refreshMilliseconds.label
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

    if (state.inactivityTimeout !== 'Never') {
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
    state.inactivityTimeout,
    state.inactivityTimeoutCategory,
    state.refreshMilliseconds,
  ])

  return (
    <AutoRefreshContext.Provider
      value={{state, dispatch, setAutoRefreshSettings}}
    >
      {children}
    </AutoRefreshContext.Provider>
  )
}

export default AutoRefreshContextProvider
