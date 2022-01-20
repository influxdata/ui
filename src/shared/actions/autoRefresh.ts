import {AutoRefreshStatus, CustomTimeRange} from 'src/types'

export type Action =
  | SetAutoRefresh
  | SetAutoRefreshStatus
  | ReturnType<typeof setAutoRefreshDuration>
  | ReturnType<typeof resetAutoRefresh>
  | ReturnType<typeof setInactivityTimeout>

interface SetAutoRefresh {
  type: 'SET_AUTO_REFRESH_INTERVAL'
  payload: {id: string; milliseconds: number; label: string}
}

export const setAutoRefreshInterval = (
  id: string,
  milliseconds: number,
  label: string
): SetAutoRefresh => ({
  type: 'SET_AUTO_REFRESH_INTERVAL',
  payload: {id, milliseconds, label},
})

interface SetAutoRefreshStatus {
  type: 'SET_AUTO_REFRESH_STATUS'
  payload: {id: string; status: AutoRefreshStatus}
}

export const setAutoRefreshStatus = (
  id: string,
  status: AutoRefreshStatus
): SetAutoRefreshStatus => ({
  type: 'SET_AUTO_REFRESH_STATUS',
  payload: {id, status},
})

export const setAutoRefreshDuration = (
  id: string,
  duration: CustomTimeRange | null
) =>
  ({
    type: 'SET_AUTO_REFRESH_DURATION',
    duration,
    id,
  } as const)

export const resetAutoRefresh = (id: string) =>
  ({
    type: 'RESET_AUTO_REFRESH',
    id,
  } as const)

export const setInactivityTimeout = (id: string, inactivityTimeout: number) =>
  ({
    type: 'SET_INACTIVITY_TIMEOUT',
    id,
    inactivityTimeout,
  } as const)
