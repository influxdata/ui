import {DESIRED_POINTS_PER_GRAPH} from 'src/shared/constants'
import {SELECTABLE_TIME_RANGES} from 'src/shared/constants/timeRanges'

export function calcWindowPeriodForRangeDuration(rangeDuration) {
  return Math.round(rangeDuration / DESIRED_POINTS_PER_GRAPH) // duration in ms
}

export function convertTimeRangeDurationToWindowPeriodDuration(rangeDuration) {
  const foundDuration = SELECTABLE_TIME_RANGES.find(
    tr => tr.seconds * 1000 === rangeDuration
  )
  if (foundDuration) {
    return foundDuration.windowPeriod
  }
  return calcWindowPeriodForRangeDuration(rangeDuration)
}

export * from './getDurationFromAST'
export * from './timeRangeLabels'
