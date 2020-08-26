// Libraries
import {get} from 'lodash'
import moment from 'moment'

// Types
import {
  AppState,
  Check,
  Dashboard,
  TimeRange,
  TimeZone,
  View,
  ViewType,
} from 'src/types'

// Utility
import {currentContext} from 'src/shared/selectors/currentContext'
import {getTimezoneOffset} from 'src/dashboards/utils/getTimezoneOffset'

// Constants
import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'

export const getTimeRange = (state: AppState): TimeRange => {
  const contextID = currentContext(state)
  if (!state.ranges || !state.ranges.hasOwnProperty(contextID)) {
    return DEFAULT_TIME_RANGE
  }

  return state.ranges[contextID] || DEFAULT_TIME_RANGE
}

export const getTimeRangeWithTimezone = (state: AppState): TimeRange => {
  const timeRange = getTimeRange(state)
  const timeZone = getTimeZone(state)

  const newTimeRange = {...timeRange}
  if (timeRange.type === 'custom' && timeZone === 'UTC') {
    // conforms dates to account to UTC with proper offset if needed
    newTimeRange.lower = setTimeToUTC(newTimeRange.lower)
    newTimeRange.upper = setTimeToUTC(newTimeRange.upper)
  }
  return newTimeRange
}

export const sortDashboardByName = (dashboards: Dashboard[]): Dashboard[] =>
  dashboards.sort((a, b) =>
    a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
  )

/**
 * We are currently using this to track whether the dashboard is active
 * in order to conditionally check the QueryCache in dashboard cells
 * in the TimeSeries.tsx file, since TimeSeries.tsx is used in Dashboard Cells and Check Alerts History
 **/
export const isCurrentPageDashboard = (state: AppState): boolean =>
  state.currentPage === 'dashboard'

// The purpose of this function is to set a user's custom time range selection
// from the local time to the same time in UTC if UTC is selected from the
// timezone dropdown. This is feature was original requested here:
// https://github.com/influxdata/influxdb/issues/17877
// and finalized across the dashboards & the data explorer here:
// https://github.com/influxdata/influxdb/pull/19146
// Example: user selected 10-11:00am and sets the dropdown to UTC
// Query should run against 10-11:00am UTC rather than querying
// 10-11:00am local time (offset depending on timezone)
export const setTimeToUTC = (date: string): string =>
  moment
    .utc(date)
    .subtract(getTimezoneOffset(), 'minutes')
    .format()

export const getTimeZone = (state: AppState): TimeZone => {
  return state.app.persisted.timeZone || 'Local'
}

export const getCheckForView = (
  state: AppState,
  view: View
): Partial<Check> => {
  const viewType: ViewType = get(view, 'properties.type')
  const checkID = get(view, 'properties.checkID')

  return viewType === 'check' ? state.resources.checks.byID[checkID] : null
}
