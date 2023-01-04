import {IconFont} from '@influxdata/clockface'
import {Notification} from 'src/types'
import {
  defaultErrorNotification,
  defaultDeletionNotification,
  defaultSuccessNotification,
} from 'src/shared/copy/notifications'

//  Dashboard Notifications

export const dashboardGetFailed = (
  dashboardID: string,
  error: string
): Notification => ({
  ...defaultErrorNotification,
  icon: IconFont.DashH,
  message: `Failed to load dashboard with id "${dashboardID}": ${error}`,
})

export const dashboardsGetFailed = (error: string): Notification => ({
  ...defaultErrorNotification,
  icon: IconFont.DashH,
  message: `Failed to retrieve dashboards: ${error}`,
})

export const dashboardUpdateFailed = (): Notification => ({
  ...defaultErrorNotification,
  icon: IconFont.DashH,
  message: 'Could not update dashboard',
})

export const dashboardDeleted = (name: string): Notification => ({
  ...defaultSuccessNotification,
  icon: IconFont.DashH,
  message: `Dashboard ${name} deleted successfully.`,
})

export const dashboardCreateFailed = () => ({
  ...defaultErrorNotification,
  message: 'Failed to create dashboard.',
})

export const dashboardCreateSuccess = () => ({
  ...defaultSuccessNotification,
  message: 'Created dashboard successfully',
})

export const dashboardDeleteFailed = (
  name: string,
  errorMessage: string
): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to delete Dashboard ${name}: ${errorMessage}.`,
})

export const dashboardCopySuccess = () => ({
  ...defaultSuccessNotification,
  message: 'Copied dashboard to the clipboard!',
})

export const dashboardCopyFailed = () => ({
  ...defaultErrorNotification,
  message: 'Failed to copy dashboard.',
})

export const cellAdded = (
  cellName?: string,
  dashboardName?: string
): Notification => ({
  ...defaultSuccessNotification,
  icon: IconFont.DashH,
  message: `Added new cell ${cellName + ' '}to dashboard ${dashboardName}`,
})

export const cellAddFailed = (
  message: string = 'unknown error'
): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to add cell: ${message}`,
})

export const cellCloneSuccess = (
  destinationDashboardID: string,
  operationType: string,
  cellName?: string
): Notification => ({
  ...defaultSuccessNotification,
  icon: IconFont.DashH,
  message: `Cell ${
    cellName ?? ''
  } successfully ${operationType} to dashboard with id ${destinationDashboardID}`,
})

export const cellCopyFailed = (err?: string): Notification => ({
  ...defaultErrorNotification,
  message: `Cell copy failed: ${err}`,
})

export const cellUpdateFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: `Failed to update cell`,
})

export const cellDeleted = (): Notification => ({
  ...defaultDeletionNotification,
  icon: IconFont.DashH,
  duration: 1900,
  message: `Cell deleted from dashboard.`,
})

export const addDashboardLabelFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to add label to dashboard',
})

export const removedDashboardLabelFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to remove label from dashboard',
})

export const copyQuerySuccess = (cellName?: string): Notification => {
  let fromCellName = ''
  if (cellName) {
    fromCellName = ` from '${cellName}'`
  }
  return {
    ...defaultSuccessNotification,
    icon: IconFont.DashH,
    message: `The query${fromCellName} was copied to your clipboard.`,
  }
}

export const copyQueryFailure = (cellName: string = ''): Notification => {
  let fromCellName = '.'
  if (cellName) {
    fromCellName = ` from '${cellName}.'`
  }
  return {
    ...defaultErrorNotification,
    message: `There was an error copying the query${fromCellName}. Please try again.`,
  }
}

export const csvDownloadFailure = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Failed to download csv.',
})

export const oldSession = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Old user session detected. Please create a new script.',
})

export const compositionUpdateFailed = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Composition was not updated. Try again.',
})

export const compositionEnded = (): Notification => ({
  ...defaultErrorNotification,
  message: 'Composition has ended. Turn on sync, to start a new composition.',
})
