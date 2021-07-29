import {getTimezoneOffset} from 'src/dashboards/utils/getTimezoneOffset'

/**
 *  is the string a valid UTC time without any time zone information?
 *  ie:  "2021-07-17T14:00:00.000Z" is valid
 *  if it has any timezone offset, then it is not a valid UTC time string
 *
 * @param formattedTimeStr
 */
function isUtcTime(formattedTimeStr) {
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
  return regex.test(formattedTimeStr)
}

/** is the time already in utc format?  if so it does not need converting. */
export const timesNeedConverting = newTimeRange => {
  // if the time range is *already* utc, does not need converting.  check just the first part, as
  // they will be formatted the same
  return !isUtcTime(newTimeRange.lower)
}

// takes in Date object and adds a duration to it.
// To add 1 hour, value = 1, unit = 'h'
// similarly, to add a minute. value = 1, unit = 'm'
export function addDurationToDate(
  input: Date,
  duration: number,
  unit?: string
): Date {
  const result = new Date(input)

  switch (unit) {
    case 'm': {
      result.setMinutes(input.getMinutes() + duration)
      return result
    }
    case 'd': {
      result.setDate(input.getDate() + duration)
      return result
    }
    default: {
      result.setHours(input.getHours() + duration)
      return result
    }
  }
}

// this function takes in a string that represents a date, and swaps the timezone to local.
// if the date passed was 2021-09-02 12:00:00 UTC the function will return 2021-09-02 12:00:00 <Local TZ>
export const setTimeToLocal = (date?: string): Date => {
  const localTime = date ? new Date(date) : new Date()
  localTime.setMinutes(localTime.getMinutes() + getTimezoneOffset())

  return localTime
}

// this method converts annotations local time format [YYYY-MM-DD h:mm:ss A] from 12 hour to 24
// this is needed because of the discrepencies between Date implementation between Chrome and Firefox
// workaround is to convert the 12 hr time to 24 hr, so that it works in both browser environments.
export const convertAnnotationTime12to24 = time12h => {
  const [date, time, meridiem] = time12h.split(' ')

  let hours = time.split(':')[0]
  const minutes = time.split(':')[1]
  const seconds = time.split(':')[2]

  if (hours === '12') {
    hours = '00'
  }

  if (meridiem === 'PM') {
    hours = parseInt(hours, 10) + 12
  }

  return `${date} ${hours}:${minutes}:${seconds}`
}
