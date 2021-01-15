const nanoPerMicro = 1000
const microPerMilli = 1000
const milliPerSecond = 1000
const secondsPerMinute = 60
const minutesPerHour = 60
const hoursPerDay = 24

const nanoPerHour =
  minutesPerHour *
  secondsPerMinute *
  milliPerSecond *
  microPerMilli *
  nanoPerMicro

export const nsToHours = (ns: number) => {
  if (ns === -1) {
    return ns
  }

  return ns / nanoPerHour
}

export const hoursToNs = (hours: number) => {
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

export const minToSeconds = (min: number) => {
  if (min === -1) {
    return min
  }
  return min * secondsPerMinute
}
