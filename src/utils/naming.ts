function prependZero(number) {
  if (number < 10) {
    return `0${number}`
  }
  return number
}

// The date parameter here is to help with testing so that we can easily mock a date
// without having to worry about the overhead of testing time
export const setCloneName = (name: string, date?: Date): string => {
  const d = date ? date : new Date()
  const year = d.getUTCFullYear()
  const month = d.getUTCMonth() + 1
  const day = d.getUTCDate()
  const hour = d.getUTCHours()
  const minutes = d.getUTCMinutes()
  const seconds = d.getUTCSeconds()
  return `${name.trim()} (cloned at ${prependZero(month)}-${prependZero(
    day
  )}-${year}:${prependZero(hour)}:${prependZero(minutes)}:${prependZero(
    seconds
  )})`
}
