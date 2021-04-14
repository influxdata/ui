import React, {
  createContext,
  useReducer,
  useCallback,
  FC,
  useEffect,
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
} from 'src/shared/actions/autoRefresh'

export const AutoRefreshContext = createContext(null)

interface AutoRefreshState {
  duration: string
  inactivityTimeout: string
  inactivityTimeoutCategory: string
  timeRange: CustomTimeRange
  refreshMilliseconds: AutoRefresh
}

const inactivityTime = function(timerToSet) {
  let time
  window.addEventListener('load', resetTimer)
  // DOM Events
  document.addEventListener('mousemove', resetTimer)
  document.addEventListener('keypress', resetTimer)

  function logout() {
    timerToSet()
  }

  function resetTimer() {
    clearTimeout(time)
    time = setTimeout(logout, 3000)
  }

  return () => {
    clearTimeout(time)
    window.removeEventListener('load', resetTimer)
    document.removeEventListener('mousemove', resetTimer)
    document.removeEventListener('keypress', resetTimer)
  }
}

export const createAutoRefreshInitialState = (
  override = {}
): AutoRefreshState => {
  return {
    duration: '',
    inactivityTimeout: 'None',
    inactivityTimeoutCategory: 'Hours',
    timeRange: {
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
    case 'SET_TIME_RANGE':
      return {...state, timeRange: action.timeRange}
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

  const {currentDashboardId, autoRefresh} = useSelector((state: AppState) => ({
    autoRefresh: state.autoRefresh[state.currentDashboard.id],
    currentDashboardId: state.currentDashboard.id,
  }))

  const reduxDispatch = useDispatch()

  const activateAutoRefresh = useCallback(
    (milliseconds: number) => {
      reduxDispatch(setAutoRefreshInterval(currentDashboardId, milliseconds))

      if (milliseconds === 0) {
        reduxDispatch(
          setAutoRefreshStatus(currentDashboardId, AutoRefreshStatus.Paused)
        )
        return
      }

      reduxDispatch(
        setAutoRefreshStatus(currentDashboardId, AutoRefreshStatus.Active)
      )
    },
    [currentDashboardId, reduxDispatch]
  )

  const calculateTimeout = useCallback(() => {
    const timeoutNumber = parseInt(state.inactivityTimeout)
    const startTime = moment(new Date())
    const copyStart = startTime.unix()
    const endTime = startTime.add(
      timeoutNumber,
      state.inactivityTimeoutCategory[0].toLowerCase()
    )

    return endTime.unix() - copyStart // Convert to milliseconds
  }, [state.inactivityTimeoutCategory, state.inactivityTimeout])

  if (state.inactivityTimeout !== 'None') {
    console.log(calculateTimeout())
  }
  useEffect(() => {
    let timer
    let activityListener
    if (
      autoRefresh.status === AutoRefreshStatus.Active ||
      state.inactivityTimeout !== 'None'
    ) {
      timer = () =>
        setTimeout(() => {
          reduxDispatch(
            setAutoRefreshStatus(currentDashboardId, AutoRefreshStatus.Paused)
          )
          dispatch({
            type: 'RESET',
          })
          console.log('timer function ran')
        }, calculateTimeout())
      activityListener = inactivityTime(timer)
      console.log(activityListener, 'this is the listener')
    }
    return () => {
      console.log('running exit strategy')
      if (activityListener) {
        activityListener()
      }
    }
  }, [
    currentDashboardId,
    reduxDispatch,
    state.inactivityTimeout,
    autoRefresh.status,
    calculateTimeout,
  ])
  return (
    <AutoRefreshContext.Provider value={{state, dispatch, activateAutoRefresh}}>
      {children}
    </AutoRefreshContext.Provider>
  )
}

export default AutoRefreshContextProvider
