// Libraries
import React, {FC, useEffect, useCallback} from 'react'
import {connect, ConnectedProps, useDispatch} from 'react-redux'

// Components
import GetResource from 'src/resources/components/GetResource'
import GetResources from 'src/resources/components/GetResources'
import DashboardPage from 'src/dashboards/components/DashboardPage'
import GetTimeRange from 'src/dashboards/components/GetTimeRange'
import DashboardRoute from 'src/shared/components/DashboardRoute'

// Actions
import {setCurrentPage} from 'src/shared/reducers/currentPage'
import {resetDashboardAutoRefresh} from 'src/shared/actions/autoRefresh'
// Utils
import {GlobalAutoRefresher} from 'src/utils/AutoRefresher'

// Constants
import {AUTOREFRESH_DEFAULT} from 'src/shared/constants'

// Types
import {AppState, ResourceType, AutoRefreshStatus} from 'src/types'

// Notifications
import {dashboardAutoRefreshTimeoutSuccess} from 'src/shared/copy/notifications'
import {notify} from 'src/shared/actions/notifications'

const {Active} = AutoRefreshStatus

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps

let timer
const DashboardContainer: FC<Props> = ({autoRefresh, dashboard}) => {
  const dispatch = useDispatch()

  const registerListeners = useCallback(() => {
    if (timer) {
      registerStopListeners()
    }
    timer = setTimeout(() => {
      dispatch(resetDashboardAutoRefresh(dashboard))
      dispatch(notify(dashboardAutoRefreshTimeoutSuccess()))
      registerStopListeners()
    }, autoRefresh.inactivityTimeout)

    window.addEventListener('load', registerListeners)
    document.addEventListener('mousemove', registerListeners)
    document.addEventListener('keypress', registerListeners)
  }, [dashboard, autoRefresh.inactivityTimeout])

  const visChangeHandler = () => {
    if (
      document.visibilityState === 'hidden' &&
      autoRefresh.status === AutoRefreshStatus.Active
    ) {
      registerListeners()
    } else {
      registerStopListeners()
    }
  }
  const registerStopListeners = useCallback(() => {
    // Stop all existing timers and deregister everythang
    if (timer) {
      clearTimeout(timer)
      timer = null
    }

    window.removeEventListener('load', registerListeners)
    document.removeEventListener('mousemove', registerListeners)
    document.removeEventListener('keypress', registerListeners)
  }, [registerListeners])

  document.addEventListener('visibilitychange', visChangeHandler)

  useEffect(() => {
    if (
      autoRefresh?.status &&
      autoRefresh.status === AutoRefreshStatus.Active &&
      autoRefresh.inactivityTimeout > 0
    ) {
      registerListeners()
    } else {
      registerStopListeners()
    }
    return () => {
      registerStopListeners()
      document.removeEventListener('visibilitychange', visChangeHandler)
    }
  }, [autoRefresh?.status, autoRefresh.inactivityTimeout])

  const stopFunc = useCallback(() => {
    if (
      !autoRefresh.infiniteDuration &&
      new Date(autoRefresh?.duration?.upper).getTime() <= new Date().getTime()
    ) {
      GlobalAutoRefresher.stopPolling()
      dispatch(resetDashboardAutoRefresh(dashboard))
    }
  }, [
    dashboard,
    dispatch,
    autoRefresh?.duration?.upper,
    autoRefresh.infiniteDuration,
  ])

  useEffect(() => {
    if (autoRefresh.status === Active) {
      GlobalAutoRefresher.poll(autoRefresh, stopFunc)
      return
    }

    GlobalAutoRefresher.stopPolling()

    return function cleanup() {
      GlobalAutoRefresher.stopPolling()
    }
  }, [autoRefresh.status, autoRefresh, stopFunc])

  useEffect(() => {
    dispatch(setCurrentPage('dashboard'))
    return () => {
      dispatch(setCurrentPage('not set'))
    }
  }, [dispatch])

  return (
    <DashboardRoute>
      <GetResource resources={[{type: ResourceType.Dashboards, id: dashboard}]}>
        <GetResources resources={[ResourceType.Buckets]}>
          <GetTimeRange />
          <DashboardPage />
        </GetResources>
      </GetResource>
    </DashboardRoute>
  )
}

const mstp = (state: AppState) => {
  const dashboard = state.currentDashboard.id
  const autoRefresh = state.autoRefresh[dashboard] || AUTOREFRESH_DEFAULT
  return {
    autoRefresh,
    dashboard,
  }
}

const connector = connect(mstp)

export default connector(DashboardContainer)
