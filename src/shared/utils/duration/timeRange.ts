import {
  TimeRange,
  CustomTimeRange,
  TimeRangeDirection,
  TimeZone,
} from 'src/types'
import {TIME_RANGE_FORMAT} from 'src/shared/constants/timeRanges'
import {createDateTimeFormatter} from 'src/utils/datetime/formatters'
import {
  durationToMilliseconds,
  removeSpacesAndNow,
  parseDuration,
} from 'src/shared/utils/duration'

export const timeRangeToDuration = (timeRange: TimeRange): string => {
  if (timeRange.upper || !timeRange.lower || !timeRange.lower.includes('now')) {
    throw new Error('cannot convert time range to duration')
  }

  return removeSpacesAndNow(timeRange.lower)
}

export const convertTimeRangeToCustom = (
  timeRange: TimeRange
): CustomTimeRange => {
  if (timeRange.type === 'custom') {
    return timeRange
  }

  const upper = new Date().toISOString()
  let lower = ''

  if (timeRange.type === 'selectable-duration') {
    const lowerDate = new Date()
    lowerDate.setSeconds(lowerDate.getSeconds() - timeRange.seconds)
    lower = lowerDate.toISOString()
  } else if (timeRange.type === 'duration') {
    const millisecondDuration = durationToMilliseconds(
      parseDuration(timeRangeToDuration(timeRange))
    )
    const lowerDate = new Date()
    lowerDate.setMilliseconds(lowerDate.getMilliseconds() - millisecondDuration)
    lower = lowerDate.toISOString()
  }

  return {
    lower,
    upper,
    type: 'custom',
  }
}

export const getTimeRangeLabel = (
  timeRange: TimeRange,
  timeZone?: TimeZone,
  singleDirection?: TimeRangeDirection
): string => {
  if (timeRange.type === 'selectable-duration') {
    return timeRange.label
  }
  if (timeRange.type === 'duration') {
    return timeRange.lower
  }
  if (timeRange.type === 'custom') {
    const formatter = createDateTimeFormatter(TIME_RANGE_FORMAT, timeZone)
    const lower = formatter.format(new Date(timeRange.lower))
    const upper = formatter.format(new Date(timeRange.upper))
    if (singleDirection === TimeRangeDirection.Upper) {
      return upper
    } else if (singleDirection === TimeRangeDirection.Lower) {
      return lower
    }
    return `${lower} - ${upper}`
  }
}
