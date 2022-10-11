import {DateTime} from 'luxon'
import {
  DEFAULT_TIME_FORMAT,
  RFC3339_PATTERN,
} from 'src/utils/datetime/constants'

const formatToLuxonMap = {
  [DEFAULT_TIME_FORMAT]: {
    format: 'yyyy-MM-dd H:mm:ss',
    regex: /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/,
  },
  'YYYY-MM-DD': {format: 'yyyy-MM-dd', regex: /\d{4}-\d{2}-\d{2}/},
  'YYYY-MM-DD HH:mm': {
    format: 'yyyy-MM-dd H:mm',
    regex: /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/,
  },
  'YYYY-MM-DD HH:mm:ss.sss': {
    format: 'yyyy-MM-dd H:mm:ss.SSS',
    regex: /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}.\d{3}/,
  },
  'YYYY-MM-DD hh:mm:ss a ZZ': {
    format: 'yyyy-MM-dd h:mm:ss a ZZZ',
    regex: /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \w{2} -?\+?\d{4}/,
  },
  'DD/MM/YYYY HH:mm:ss.sss': {
    format: 'dd/MM/yyyy H:mm:ss.SSS',
    regex: /\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}.\d{3}/,
  },
  'DD/MM/YYYY hh:mm:ss.sss a': {
    format: 'dd/MM/yyyy h:mm:ss.SSS a',
    regex: /\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}.\d{3} \w{2}/,
  },
  'MM/DD/YYYY HH:mm:ss.sss': {
    format: 'MM/dd/yyyy H:mm:ss.SSS',
    regex: /\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}.\d{3}/,
  },
  'MM/DD/YYYY hh:mm:ss.sss a': {
    format: 'MM/dd/yyyy h:mm:ss.SSS a',
    regex: /\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}.\d{3} \w{2}/,
  },
  'YYYY/MM/DD HH:mm:ss': {
    format: 'yyyy/MM/dd H:mm:ss',
    regex: /\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}/,
  },
  'YYYY/MM/DD hh:mm:ss a': {
    format: 'yyyy/MM/dd h:mm:ss a',
    regex: /\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2} \w{2}/,
  },
  'HH:mm': {format: 'H:mm', regex: /\d{2}:\d{2}/},
  'hh:mm a': {format: 'h:mm a', regex: /\d{2}:\d{2} \w{2}/},
  'HH:mm:ss': {format: 'H:mm:ss', regex: /\d{2}:\d{2}:\d{2}/},
  'hh:mm:ss a': {format: 'h:mm:ss a', regex: /\d{2}:\d{2}:\d{2} \w{2}/},
  'HH:mm:ss ZZ': {
    format: 'h:mm:ss ZZZ',
    regex: /\d{2}:\d{2}:\d{2} -?\+?\d{4}/,
  },
  'hh:mm:ss a ZZ': {
    format: 'h:mm:ss a ZZZ',
    regex: /\d{2}:\d{2}:\d{2} \w{2} -?\+?\d{4}/,
  },
  'HH:mm:ss.sss': {format: 'H:mm:ss.SSS', regex: /\d{2}:\d{2}:\d{2}.\d{3}/},
  'hh:mm:ss.sss a': {
    format: 'h:mm:ss.SSS a',
    regex: /\d{2}:\d{2}:\d{2}.\d{3} \w{2}/,
  },
  'MMMM D, YYYY HH:mm:ss': {
    format: 'LLLL d, yyyy H:mm:ss',
    regex: /[a-zA-Z]+ \d{1,2}, \d{4} \d{2}:\d{2}:\d{2}/,
  },
  'MMMM D, YYYY hh:mm:ss a': {
    format: 'LLLL d, yyyy h:mm:ss a',
    regex: /[a-zA-Z]+ \d{1,2}, \d{4} \d{2}:\d{2}:\d{2} \w{2}/,
  },
  'dddd, MMMM D, YYYY HH:mm:ss': {
    format: 'EEEE, LLLL d, yyyy H:mm:ss',
    regex: /[a-zA-Z]+, [a-zA-Z]+ \d{1,2}, \d{4} \d{2}:\d{2}:\d{2}/,
  },
  'dddd, MMMM D, YYYY hh:mm:ss a': {
    format: 'EEEE, LLLL d, yyyy h:mm:ss a',
    regex: /[a-zA-Z]+, [a-zA-Z]+ \d{1,2}, \d{4} \d{2}:\d{2}:\d{2} \w{2}/,
  },
  '200601021504': {
    format: 'yyyyMMddhhmm',
  },
  '02/01/06 03:04:05 PM': {
    format: 'dd/MM/yy hh:mm:ss a',
  },
  '2006-01-02T15:04:05Z07:00': {
    format: 'dd/MM/yy hh:mm:ss a',
  },
}

export const getLuxonFormatString = (format: string): string => {
  const luxonFormatString = formatToLuxonMap[format].format
    ? formatToLuxonMap[format].format
    : formatToLuxonMap[DEFAULT_TIME_FORMAT].format

  return luxonFormatString
}

const strictCheck = (dateString: string, format: string): boolean => {
  return formatToLuxonMap[format].regex.test(dateString)
}

export const isValid = (
  formattedDateTimeString: string,
  format: string
): boolean => {
  const dateFnsFormatString = getLuxonFormatString(format)

  return DateTime.fromFormat(formattedDateTimeString, dateFnsFormatString)
    .isValid
}

// strict check means it strictly enforces the number of digits in the format.
// example, without strictness: HH:mm validates 9:00 and 09:00
// with strictness: HH:mm returns true only for 09:00 and false for 9:00,
export const isValidStrictly = (
  formattedDateTimeString: string,
  format: string
): boolean => {
  const dateFnsFormatString = getLuxonFormatString(format)

  return (
    strictCheck(formattedDateTimeString, format) &&
    DateTime.fromFormat(formattedDateTimeString, dateFnsFormatString).isValid
  )
}

export const isValidRFC3339 = (input: string) => {
  return (
    RFC3339_PATTERN.test(input) && new Date(input).toString() !== 'Invalid Date'
  )
}
