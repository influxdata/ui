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
    console.log('ack42: column type is time,,,,making/getting formatter')
    const formatOptions = {
      timeZone: timeZone === 'Local' ? undefined : timeZone,
      format: resolveTimeFormat(timeFormat),
    }
    console.log('ack42: formatOptions: ', formatOptions)

    console.log('ack42: timeFormat', timeFormat)

    if (timeFormat?.includes('HH')) {
      formatOptions['hour12'] = false
      console.log('ack42: setting hour12 to false')
    } else {
      console.log('ack42: NOT setting hour12 to false')
    }

    console.log('ack42(b): formatOPtions', formatOptions)

    return timeFormatter(formatOptions)
  }

  return null
}
