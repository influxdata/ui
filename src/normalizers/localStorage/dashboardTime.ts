// Utils
import {validateAndTypeRange} from 'src/dashboards/utils/time'

// Types
import {RangeState} from 'src/dashboards/reducers/ranges'

const isCorrectType = (bound: any) =>
  typeof bound === 'string' || bound === null

export const getLocalStateRangesAsArray = (ranges: any[]): RangeState => {
  const normalizedRanges = ranges.filter(r => {
    if (typeof r !== 'object') {
      return false
    }

    // check for presence of keys
    if (
      !r.hasOwnProperty('dashboardID') ||
      !r.hasOwnProperty('lower') ||
      !r.hasOwnProperty('upper')
    ) {
      return false
    }

    const {dashboardID, lower, upper} = r

    if (!dashboardID || typeof dashboardID !== 'string') {
      return false
    }

    if (!lower && !upper) {
      return false
    }

    if (!isCorrectType(lower) || !isCorrectType(upper)) {
      return false
    }

    return true
  })

  const rangesObject: RangeState = {}

  normalizedRanges.forEach(
    (range: {dashboardID: string; lower: string; upper: string}) => {
      const {dashboardID, lower, upper} = range

      const timeRange = validateAndTypeRange({lower, upper})
      if (timeRange) {
        rangesObject[dashboardID] = timeRange
      }
    }
  )
  return rangesObject
}

const normalizeRangesState = (ranges: RangeState): RangeState => {
  const normalized = {}

  for (const key in ranges) {
    if (
      typeof ranges[key] === 'object' &&
      ranges[key].hasOwnProperty('upper') &&
      ranges[key].hasOwnProperty('lower') &&
      isCorrectType(ranges[key].lower) &&
      isCorrectType(ranges[key].upper)
    ) {
      const typedRange = validateAndTypeRange(ranges[key])
      if (typedRange) {
        normalized[key] = typedRange
      }
    }
  }

  return normalized
}

export const getLocalStateRanges = (ranges: RangeState | any[]) => {
  if (Array.isArray(ranges)) {
    return getLocalStateRangesAsArray(ranges)
  } else if (typeof ranges === 'object') {
    return normalizeRangesState(ranges)
  } else {
    return {}
  }
}

export const setLocalStateRanges = (ranges: RangeState) => {
  return normalizeRangesState(ranges)
}
