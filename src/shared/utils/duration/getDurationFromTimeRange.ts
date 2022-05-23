import {TimeRange} from 'src/types'
import {
  millisecondsToDuration,
  calcWindowPeriodForRangeDuration,
} from 'src/shared/utils/duration'

export function getDurationFromTimeRange(timeRange: TimeRange) {
  if (timeRange.type === 'selectable-duration') {
    return millisecondsToDuration(timeRange.windowPeriod)
  }

  if (timeRange.type === 'custom') {
    const upper = Date.parse(timeRange.upper)
    const lower = Date.parse(timeRange.lower)
    return millisecondsToDuration(
      calcWindowPeriodForRangeDuration(upper - lower)
    )
  }

  throw new Error(
    'Unknown timeRange type provided to getWindowPeriodFromTimeRange'
  )
}
