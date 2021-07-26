import {resolveTimeFormat} from 'src/visualization/utils/timeFormat'
import {Base, TimeZone} from 'src/types'
import {VIS_SIG_DIGITS, DEFAULT_TIME_FORMAT} from 'src/shared/constants'
import {
  binaryPrefixFormatter,
  timeFormatter,
  siPrefixFormatter,
  ColumnType,
} from '@influxdata/giraffe'

interface GetFormatterOptions {
  prefix?: string
  suffix?: string
  base?: Base
  timeZone?: TimeZone
  trimZeros?: boolean
  timeFormat?: string
  format?: boolean
}

export const getFormatter = (
  columnType: ColumnType,
  {
    prefix,
    suffix,
    base,
    timeZone,
    trimZeros = true,
    timeFormat = DEFAULT_TIME_FORMAT,
    format,
  }: GetFormatterOptions = {}
): null | ((x: any) => string) => {
  // timeFormat was being returned a empty string, which meant TypeScript will not
  // replace it with the default, so we need to do it here with a check.
  if (timeFormat === '') {
    timeFormat = DEFAULT_TIME_FORMAT
  }

  if (columnType === 'number' && base === '2') {
    return binaryPrefixFormatter({
      prefix,
      suffix,
      significantDigits: VIS_SIG_DIGITS,
      format,
    })
  }

  if (columnType === 'number' && base === '10') {
    return siPrefixFormatter({
      prefix,
      suffix,
      significantDigits: VIS_SIG_DIGITS,
      trimZeros,
      format,
    })
  }

  if (columnType === 'number' && base === '') {
    return siPrefixFormatter({
      prefix,
      suffix,
      significantDigits: VIS_SIG_DIGITS,
      trimZeros,
      format: true,
    })
  }

  if (columnType === 'time') {
    const formatOptions = {
      timeZone: timeZone === 'Local' ? undefined : timeZone,
      format: resolveTimeFormat(timeFormat),
    }
    if (formatOptions.format.includes('HH')) {
      formatOptions['hour12'] = false
    }
    return timeFormatter(formatOptions)
  }

  return null
}
