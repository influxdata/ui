export interface Duration {
  day: number
  hour: number
  minute: number
  second: number
}

const secondsToDuration = (seconds: number): Duration => {
  let minutes = Math.floor(seconds / 60)
  seconds = seconds % 60
  let hours = Math.floor(minutes / 60)
  minutes = minutes % 60
  const days = Math.floor(hours / 24)
  hours = hours % 24

  return {
    day: days,
    hour: hours,
    minute: minutes,
    second: seconds,
  }
}

export const ruleToString = (seconds: number): string => {
  const duration = secondsToDuration(seconds)
  const rpString = Object.entries(duration).reduce((acc, [k, v]) => {
    if (!v) {
      return acc
    }

    const plural = v > 1 ? `${k}s` : k
    return `${acc} ${v} ${plural}`
  }, '')

  if (!rpString) {
    return 'forever'
  }

  console.log(rpString.trim())
  return rpString.trim()
}
