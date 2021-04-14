import {AutoRefreshStatus, CustomTimeRange} from 'src/types'

export type Action =
  | SetAutoRefresh
  | SetAutoRefreshStatus
  | ReturnType<typeof setAutoRefreshDuration>
  | ReturnType<typeof resetDashboardAutoRefresh>

interface SetAutoRefresh {
  type: 'SET_AUTO_REFRESH_INTERVAL'
  payload: {dashboardID: string; milliseconds: number}
}

export const setAutoRefreshInterval = (
  dashboardID: string,
  milliseconds: number
): SetAutoRefresh => ({
  type: 'SET_AUTO_REFRESH_INTERVAL',
  payload: {dashboardID, milliseconds},
})

interface SetAutoRefreshStatus {
  type: 'SET_AUTO_REFRESH_STATUS'
  payload: {dashboardID: string; status: AutoRefreshStatus}
}

export const setAutoRefreshStatus = (
  dashboardID: string,
  status: AutoRefreshStatus
): SetAutoRefreshStatus => ({
  type: 'SET_AUTO_REFRESH_STATUS',
  payload: {dashboardID, status},
})

export const setAutoRefreshDuration = (
  dashboardID: string,
  duration: CustomTimeRange | null
) =>
  ({
    type: 'SET_AUTO_REFRESH_DURATION',
    duration,
    dashboardID,
  } as const)

export const resetDashboardAutoRefresh = (dashboardID: string) =>
  ({
    type: 'RESET_DASHBOARD_AUTO_REFRESH',
    dashboardID,
  } as const)
