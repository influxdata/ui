import {TimeRange} from 'src/types'
import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {LanguageType} from 'src/dataExplorer/components/resources'

export const durationRegExp = /^(\-)?(([0-9]+)(y|mo|w|d|h|ms|s|m|us|µs|ns))+$/g
const singleDuration = /(([0-9]+)(y|mo|w|d|h|ms|s|m|us|µs|ns))/g
const nanosecondDuration = /(([0-9]+)(ns))/g
const microsecondDuration = /(([0-9,\.]+)(\W?)(microsecond))/g

const convertToInterval = (
  upperOrLower: string,
  languageType: LanguageType
): string => {
  if (upperOrLower == null || upperOrLower == 'now()') {
    return 'now()'
  }
  if (!!upperOrLower.match(durationRegExp)) {
    const durationIntoPast = upperOrLower.trim()[0] == '-'
    let interval = [
      ...upperOrLower
        .replace('-', '') // -12d6h => 12d6h
        .matchAll(singleDuration), // [['12d','12','h'],['6h','6','h']]
    ]
      .map(x => x[0]) // because want most greedy match for each
      .join(' ') // '12d 6h'
      .replace('y', ' year')
      .replace('h', ' hour') // match h, before month with h
      .replace('mo', ' month')
      .replace('w', ' week')
      .replace('d', ' day')
      .replace('ms', ' millisecond') // match ms, before m|s
      .replace('us', ' microsecond')
      .replace('µs', ' microsecond')
      .replace('m ', ' minute ') // don't match `m` in millisecond, etc
      .replace('s ', ' second ')

    // postgres does not support nanoseconds. Convert.
    let toReplace = interval.match(nanosecondDuration)
    if (!!toReplace || toReplace?.length > 0) {
      try {
        toReplace.forEach(init => {
          const replacement = `${
            parseFloat(init.split('ns')[0]) / 1000
          } microsecond`
          interval = interval.replace(init, replacement)
        })
      } catch (e) {
        throw new Error(`Cannot handle nanosecond: ${e}`)
      }
    }

    // our flight sql is not supporting microseconds. Convert.
    toReplace = interval.match(microsecondDuration)
    if (!!toReplace || toReplace?.length > 0) {
      try {
        toReplace.forEach(init => {
          const replacement = `${
            parseFloat(init.split('microsecond')[0]) / 1000
          } millisecond`
          interval = interval.replace(init, replacement)
        })
      } catch (e) {
        throw new Error(`Cannot handle microsecond: ${e}`)
      }
    }

    return `now() ${durationIntoPast ? '-' : '+'} interval '${interval}'`
  }

  const timestamp = new Date(upperOrLower)
  if (timestamp.toTimeString() === 'Invalid Date') {
    throw new Error(`Unknown custom time: ${upperOrLower}`)
  }

  return languageType === LanguageType.SQL
    ? `timestamp '${timestamp.toISOString()}'`
    : `'${timestamp.toISOString()}'`
}

/** Convert duration to postgres interval.
 *     https://www.postgresql.org/docs/15/datatype-datetime.html#DATATYPE-INTERVAL-INPUT
 */
export const rangeToSQLInterval = (range: TimeRange) => {
  switch (range.type) {
    case 'selectable-duration':
      return range.sql
    case 'custom':
    case 'duration':
      const upper = convertToInterval(range.lower, LanguageType.SQL)
      const lower = convertToInterval(range.upper, LanguageType.SQL)
      return `time >= ${upper} AND time <= ${lower}`
    default:
      return DEFAULT_TIME_RANGE.sql
  }
}
