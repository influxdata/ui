import {TimeRange} from 'src/types'
import {millisecondsToDuration} from 'src/shared/utils/duration'
import {convertMillisecondDurationToWindowPeriod} from 'src/shared/utils/windowPeriod'

/**
 * Given the timeRange variable, ignoring all else.
 * (a.k.a. ignoring the flux query itself)
 * Return the windowPeriod as a duration string.
 *
 * @param timeRange -- timeRange, UI type
 * @returns {string} -- string value representing a duration. e.g. `-15m`
 */
export function getWindowPeriodDurationFromTimeRange(
  timeRange: TimeRange
): string {
  if (timeRange.type === 'selectable-duration') {
    return millisecondsToDuration(timeRange.windowPeriod)
  }

  if (timeRange.type === 'custom') {
    const upper = Date.parse(timeRange.upper)
    const lower = Date.parse(timeRange.lower)
    return millisecondsToDuration(
      convertMillisecondDurationToWindowPeriod(upper - lower)
    )
  }

  throw new Error(
    'Unknown timeRange type provided to getWindowPeriodDurationFromTimeRange'
  )
}
