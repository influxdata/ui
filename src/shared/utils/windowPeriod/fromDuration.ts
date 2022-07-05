import {
  SELECTABLE_TIME_RANGES,
  DESIRED_POINTS_PER_GRAPH,
} from 'src/shared/constants/timeRanges'

function calcWindowPeriodForRangeDuration(rangeDuration: number) {
  return Math.round(rangeDuration / DESIRED_POINTS_PER_GRAPH) // duration in ms
}

/**
 * Determining the `windowPeriod`
 * from the timeRange numerical duration (a.k.a. upper - lower) in milliseconds.
 *
 * @param rangeDuration -- given the duration in milliseconds
 * @returns {number} -- numeric value of windowPeriod
 */
export function convertMillisecondDurationToWindowPeriod(
  rangeDuration: number
): number {
  const foundDuration = SELECTABLE_TIME_RANGES.find(
    tr => tr.seconds * 1000 === rangeDuration
  )
  if (foundDuration) {
    return foundDuration.windowPeriod
  }
  return calcWindowPeriodForRangeDuration(rangeDuration)
}
