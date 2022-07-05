import {TimeRange} from 'src/types'
import {
  millisecondsToDuration,
  durationToMilliseconds,
  parseDuration,
} from 'src/shared/utils/duration'
import {convertMillisecondDurationToWindowPeriod} from 'src/shared/utils/windowPeriod'

/**
 * @param timeRange -- timeRange, UI type
 * @returns {number} -- milliseconds of windowPeriod
 */
const windowPeriodFromTimeRange = (timeRange: TimeRange): number => {
  switch (timeRange.type) {
    case 'selectable-duration':
      return timeRange.windowPeriod
    case 'custom':
      const upper = Date.parse(timeRange.upper)
      const lower = Date.parse(timeRange.lower)
      return convertMillisecondDurationToWindowPeriod(upper - lower)
    case 'duration':
      const ms = durationToMilliseconds(parseDuration(timeRange.lower))
      return convertMillisecondDurationToWindowPeriod(ms)
    default:
      throw new Error(
        'Unknown timeRange type provided to windowPeriodFromTimeRange'
      )
  }
}

/**
 * @param timeRange -- timeRange, UI type
 * @returns {string} -- string duration, for the windowPeriod. e.g. `-15m`
 */
export function getWindowPeriodDurationFromTimeRange(
  timeRange: TimeRange
): string | null {
  try {
    return millisecondsToDuration(windowPeriodFromTimeRange(timeRange))
  } catch (e) {
    console.warn(e)
    return null
  }
}
