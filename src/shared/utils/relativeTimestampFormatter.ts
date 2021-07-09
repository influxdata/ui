import {createRelativeFormatter} from 'src/utils/datetime/formatters'

export const relativeTimestampFormatter = (
  time: string,
  prefix?: string
): string => {
  const formatter = createRelativeFormatter()
  const timeFromNow = formatter.formatRelative(new Date(time))

  if (prefix) {
    return `${prefix}${timeFromNow}`
  }

  return timeFromNow
}
