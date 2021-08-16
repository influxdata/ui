import {DateTime} from 'luxon'
import {DEFAULT_TIME_FORMAT} from 'src/utils/datetime/constants'

const formatToLuxonMap = {
  [DEFAULT_TIME_FORMAT]: {
    format: 'yyyy-MM-dd HH:mm:ss',
    regex: /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/,
  },
  'YYYY-MM-DD': {format: 'yyyy-MM-dd', regex: /\d{4}-\d{2}-\d{2}/},
  'YYYY-MM-DD HH:mm': {
    format: 'yyyy-MM-dd HH:mm',
    regex: /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/,
  },
  'YYYY-MM-DD HH:mm:ss.sss': {
    format: 'yyyy-MM-dd HH:mm:ss.SSS',
    regex: /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}.\d{3}/,
  },
  'YYYY-MM-DD hh:mm:ss a ZZ': {
    format: 'yyyy-MM-dd hh:mm:ss a ZZZ',
    regex: /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \w{2} -?\+?\d{4}/,
  },
  'DD/MM/YYYY HH:mm:ss.sss': {
    format: 'dd/MM/yyyy HH:mm:ss.SSS',
    regex: /\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}.\d{3}/,
  },
  'DD/MM/YYYY hh:mm:ss.sss a': {
    format: 'dd/MM/yyyy hh:mm:ss.SSS a',
    regex: /\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}.\d{3} \w{2}/,
  },
  'MM/DD/YYYY HH:mm:ss.sss': {
    format: 'MM/dd/yyyy HH:mm:ss.SSS',
    regex: /\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}.\d{3}/,
  },
  'MM/DD/YYYY hh:mm:ss.sss a': {
    format: 'MM/dd/yyyy hh:mm:ss.SSS a',
    regex: /\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}.\d{3} \w{2}/,
  },
  'YYYY/MM/DD HH:mm:ss': {
    format: 'yyyy/MM/dd HH:mm:ss',
    regex: /\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}/,
  },
  'YYYY/MM/DD hh:mm:ss a': {
    format: 'yyyy/MM/dd hh:mm:ss a',
    regex: /\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2} \w{2}/,
  },
  'HH:mm': {format: 'HH:mm', regex: /\d{2}:\d{2}/},
  'hh:mm a': {format: 'hh:mm a', regex: /\d{2}:\d{2} \w{2}/},
  'HH:mm:ss': {format: 'HH:mm:ss', regex: /\d{2}:\d{2}:\d{2}/},
  'hh:mm:ss a': {format: 'hh:mm:ss a', regex: /\d{2}:\d{2}:\d{2} \w{2}/},
  'HH:mm:ss ZZ': {
    format: 'HH:mm:ss ZZZ',
    regex: /\d{2}:\d{2}:\d{2} -?\+?\d{4}/,
  },
  'hh:mm:ss a ZZ': {
    format: 'hh:mm:ss a ZZZ',
    regex: /\d{2}:\d{2}:\d{2} \w{2} -?\+?\d{4}/,
  },
  'HH:mm:ss.sss': {format: 'HH:mm:ss.SSS', regex: /\d{2}:\d{2}:\d{2}.\d{3}/},
  'hh:mm:ss.sss a': {
    format: 'hh:mm:ss.SSS a',
    regex: /\d{2}:\d{2}:\d{2}.\d{3} \w{2}/,
  },
  'MMMM D, YYYY HH:mm:ss': {
    format: 'LLLL d, yyyy HH:mm:ss',
    regex: /[a-zA-Z]+ \d{1,2}, \d{4} \d{2}:\d{2}:\d{2}/,
  },
  'MMMM D, YYYY hh:mm:ss a': {
    format: 'LLLL d, yyyy hh:mm:ss a',
    regex: /[a-zA-Z]+ \d{1,2}, \d{4} \d{2}:\d{2}:\d{2} \w{2}/,
  },
  'dddd, MMMM D, YYYY HH:mm:ss': {
    format: 'EEEE, LLLL d, yyyy HH:mm:ss',
    regex: /[a-zA-Z]+, [a-zA-Z]+ \d{1,2}, \d{4} \d{2}:\d{2}:\d{2}/,
  },
  'dddd, MMMM D, YYYY hh:mm:ss a': {
    format: 'EEEE, LLLL d, yyyy hh:mm:ss a',
    regex: /[a-zA-Z]+, [a-zA-Z]+ \d{1,2}, \d{4} \d{2}:\d{2}:\d{2} \w{2}/,
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

  return (
    strictCheck(formattedDateTimeString, format) &&
    DateTime.fromFormat(formattedDateTimeString, dateFnsFormatString).isValid
  )
}
