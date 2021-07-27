// takes in Date object and adds a duration to it.
// To add 1 hour, value = 1, unit = 'h'
// similarly, to add a minute. value = 1, unit = 'm'
export function incrementDate(input: Date, value: number, unit?: string): Date {
  const result = new Date(input)

  switch (unit) {
    case 'm': {
      result.setMinutes(input.getMinutes() + value)
      return result
    }
    case 'd': {
      result.setDate(input.getDate() + value)
      return result
    }
    default: {
      result.setHours(input.getHours() + value)
      return result
    }
  }
}
