const nanoPerMicro = 1000
const microPerMilli = 1000
const milliPerSecond = 1000
const secondsPerMinute = 60
const minutesPerHour = 60
const hoursPerDay = 24

const secondsPerHour = minutesPerHour * secondsPerMinute

const nanoPerHour =
  secondsPerHour * milliPerSecond * microPerMilli * nanoPerMicro

const nanoPerSecond = milliPerSecond * microPerMilli * nanoPerMicro

export const nsToHours = (ns: number): number => {
  if (ns === -1) {
    return ns
  }

  return ns / nanoPerHour
}

export const secondsToHours = (seconds: number): number => {
  if (seconds === -1) {
    return seconds
  }

  return seconds / secondsPerHour
}

export const hoursToNs = (hours: number): number => {
  if (hours === -1) {
    return -1
  }

  return hours * nanoPerHour
}

export const hoursToDays = (hours: number) => {
  if (hours === -1) {
    return hours
  }

  return hours / hoursPerDay
}

export const nsToDays = (ns: number): number => {
  const hours = nsToHours(ns)
  return hoursToDays(hours)
}

export const secondsToDays = (seconds: number): number => {
  const hours = secondsToHours(seconds)
  return hoursToDays(hours)
}

export const minToSeconds = (min: number) => {
  if (min === -1) {
    return min
  }
  return min * secondsPerMinute
}

export const nsToSeconds = (ns: number): number => {
  if (ns === -1) {
    return ns
  }

  return ns / nanoPerSecond
}

export const secondsToNs = (seconds: number): number => {
  if (seconds === -1) {
    return seconds
  }

  return seconds * nanoPerSecond
}
