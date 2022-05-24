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

// checks whether the passed date is ISO format
export function isISODate(dateString: string): boolean {
  try {
    const date = new Date(dateString)
    return date.toISOString() === dateString
  } catch (error) {
    return false
  }
}

export const convertStringToEpoch = (date: string): number => {
  const convertedDate = new Date(date)
  if (convertedDate.toDateString() === 'Invalid Date') {
    return NaN
  }
  return convertedDate.getTime()
}
