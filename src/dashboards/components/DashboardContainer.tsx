// Libraries
import React, {FC, useEffect, useCallback, useRef} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Components
import GetResource from 'src/resources/components/GetResource'
import GetResources from 'src/resources/components/GetResources'
import DashboardPage from 'src/dashboards/components/DashboardPage'
import GetTimeRange from 'src/dashboards/components/GetTimeRange'
import DashboardRoute from 'src/shared/components/DashboardRoute'

// Actions
import {setCurrentPage} from 'src/shared/reducers/currentPage'
import {resetAutoRefresh} from 'src/shared/actions/autoRefresh'
// Utils
import {GlobalAutoRefresher} from 'src/utils/AutoRefresher'

// Constants
import {AUTOREFRESH_DEFAULT} from 'src/shared/constants'

// Types
import {AppState, ResourceType, AutoRefreshStatus} from 'src/types'

// Notifications
import {dashboardAutoRefreshTimeoutSuccess} from 'src/shared/copy/notifications'
import {notify} from 'src/shared/actions/notifications'

// History
import {useRouteMatch} from 'react-router-dom'

// Metrics
import {event} from 'src/cloud/utils/reporting'

const DashboardContainer: FC = () => {
  const dispatch = useDispatch()
  const {autoRefresh, dashboardID} = useSelector((state: AppState) => {
    const dashboardID = state.currentDashboard.id
    const autoRefresh =
      state.autoRefresh[`dashboard-${dashboardID}`] || AUTOREFRESH_DEFAULT
    return {
      autoRefresh,
      dashboardID,
    }
  })
  const isEditing = useRouteMatch(
    '/orgs/:orgID/dashboards/:dashboardID/cells/:cellID/edit'
  )

  const startTimeout = () => {
    GlobalAutoRefresher.startTimeout(
      timeoutFunction,
      autoRefresh.inactivityTimeout
    )
  }

  const registerListeners = useCallback(() => {
    window.addEventListener('load', registerListeners)
    document.addEventListener('mousemove', registerListeners)
    document.addEventListener('keypress', registerListeners)
  }, [])

  const registerStopListeners = useCallback(() => {
    window.removeEventListener('load', registerListeners)
    document.removeEventListener('mousemove', registerListeners)
    document.removeEventListener('keypress', registerListeners)
  }, [registerListeners])

  const timeoutFunction = useCallback(() => {
    dispatch(resetAutoRefresh(`dashboard-${dashboardID}`))
    dispatch(notify(dashboardAutoRefreshTimeoutSuccess()))
    registerStopListeners()
    event('dashboards.autorefresh.dashboardcontainer.inactivitytimeout', {
      timeout: autoRefresh.inactivityTimeout,
    })
  }, [
    autoRefresh.inactivityTimeout,
    dashboardID,
    dispatch,
    registerStopListeners,
  ])

  const stopFunc = useCallback(() => {
    if (
      !autoRefresh.infiniteDuration &&
      new Date(autoRefresh?.duration?.upper).getTime() <= new Date().getTime()
    ) {
      GlobalAutoRefresher.stopPolling()
      dispatch(resetAutoRefresh(`dashboard-${dashboardID}`))
    }
  }, [
    dashboardID,
    dispatch,
    autoRefresh?.duration?.upper,
    autoRefresh.infiniteDuration,
  ])

  const visChangeHandler = useCallback(() => {
    if (
      document.visibilityState === 'hidden' &&
      autoRefresh.status === AutoRefreshStatus.Active
    ) {
      GlobalAutoRefresher.stopPolling()
    } else if (document.visibilityState === 'visible') {
      GlobalAutoRefresher.poll(autoRefresh, stopFunc)
    }
  }, [autoRefresh.status, stopFunc])

  useEffect(() => {
    if (isEditing) {
      registerStopListeners()
      GlobalAutoRefresher.stopPolling()
      return
    }

    if (autoRefresh?.status === AutoRefreshStatus.Active) {
      GlobalAutoRefresher.poll(autoRefresh, stopFunc)
      document.addEventListener('visibilitychange', visChangeHandler)
      if (autoRefresh.inactivityTimeout > 0) {
        registerStopListeners()
        startTimeout()
        registerListeners()
      }
    } else {
      registerStopListeners()
    }

    return () => {
      registerStopListeners()
      GlobalAutoRefresher.stopPolling()
      document.removeEventListener('visibilitychange', visChangeHandler)
    }
  }, [
    autoRefresh.interval,
    autoRefresh?.status,
    autoRefresh.inactivityTimeout,
    stopFunc,
    isEditing?.path,
    registerListeners,
    registerStopListeners,
    startTimeout,
    visChangeHandler,
  ])

  useEffect(() => {
    dispatch(setCurrentPage('dashboard'))
    return () => {
      dispatch(setCurrentPage('not set'))
    }
  }, [dispatch])

  return (
    <DashboardRoute>
      <GetResource
        resources={[{type: ResourceType.Dashboards, id: dashboardID}]}
      >
        <GetResources resources={[ResourceType.Buckets]}>
          <GetTimeRange />
          <DashboardPage />
        </GetResources>
      </GetResource>
    </DashboardRoute>
  )
}

export default DashboardContainer
