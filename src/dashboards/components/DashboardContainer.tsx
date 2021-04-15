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
      registerStopListeners()
    }, 15000)

    window.addEventListener('load', registerListeners)
    document.addEventListener('mousemove', registerListeners)
    document.addEventListener('keypress', registerListeners)
  }, [dashboard])

  const registerStopListeners = useCallback(() => {
    // Stop all existing timers and deregister everythang
    if (!timer) {
      return
    }
    clearTimeout(timer)
    timer = null
    window.removeEventListener('load', registerListeners)
    document.removeEventListener('mousemove', registerListeners)
    document.removeEventListener('keypress', registerListeners)
  }, [timer, dashboard])

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
    }
  }, [autoRefresh?.status, autoRefresh.inactivityTimeout])

  const stopFunc = useCallback(() => {
    if (autoRefresh?.duration?.upper <= new Date().toISOString()) {
      GlobalAutoRefresher.stopPolling()
      dispatch(resetDashboardAutoRefresh(dashboard))
    }
  }, [dashboard, dispatch, autoRefresh?.duration?.upper])

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
          <DashboardPage autoRefresh={autoRefresh} />
        </GetResources>
      </GetResource>
    </DashboardRoute>
  )
}

const mstp = (state: AppState) => {
  const dashboard = state.currentDashboard.id
  const autoRefresh: any = state.autoRefresh[dashboard] || AUTOREFRESH_DEFAULT
  return {
    autoRefresh,
    dashboard,
  }
}

const connector = connect(mstp)

export default connector(DashboardContainer)
