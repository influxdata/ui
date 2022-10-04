export interface Duration {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const secondsToDuration = (seconds: number): Duration => {
  let minutes = Math.floor(seconds / 60)
  seconds = seconds % 60
  let hours = Math.floor(minutes / 60)
  minutes = minutes % 60
  const days = Math.floor(hours / 24)
  hours = hours % 24

  return {
    days,
    hours,
    minutes,
    seconds,
  }
}

export const ruleToString = (seconds: number): string => {
  const duration = secondsToDuration(seconds)
  const rpString = Object.entries(duration).reduce((acc, [k, v]) => {
    if (!v) {
      return acc
    }

    // removes the trailing plural 's' if magnitude is singular
    const k_singular_or_plural = v <= 1 ? k.slice(0, -1) : k
    return `${acc} ${v} ${k_singular_or_plural}`
  }, '')

  if (!rpString) {
    return 'forever'
  }

  return rpString.trim()
}
