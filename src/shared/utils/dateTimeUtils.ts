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
