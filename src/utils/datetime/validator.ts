import {isMatch} from 'date-fns'

const formatterToDateFnsMap = {
  'YYYY-MM-DD HH:mm:ss': 'yyyy-MM-dd HH:mm:ss', // DEFAULT_TIME_FORMAT
  'YYYY-MM-DD hh:mm:ss a ZZ': 'yyyy-MM-dd hh:mm:ss a xxxx',
  'DD/MM/YYYY HH:mm:ss.sss': 'dd/MM/yyyy HH:mm:ss.SSS',
  'DD/MM/YYYY hh:mm:ss.sss a': 'dd/MM/yyyy hh:mm:ss.SSS bb',
  'MM/DD/YYYY HH:mm:ss.sss': 'MM/dd/yyyy HH:mm:ss.SSS',
  'MM/DD/YYYY hh:mm:ss.sss a': 'MM/dd/yyyy hh:mm:ss.SSS bb',
  'YYYY/MM/DD HH:mm:ss': 'yyyy/MM/dd HH:mm:ss',
  'YYYY/MM/DD hh:mm:ss a': 'yyyy/MM/dd hh:mm:ss bb',
  'HH:mm': 'HH:mm',
  'hh:mm a': 'hh:mm bb',
  'HH:mm:ss': 'HH:mm:ss',
  'hh:mm:ss a': 'hh:mm:ss bb',
  'HH:mm:ss ZZ': 'HH:mm:ss xxxx',
  'hh:mm:ss a ZZ': 'hh:mm:ss bb xxxx',
  'HH:mm:ss.sss': 'HH:mm:ss.SSS',
  'hh:mm:ss.sss a': 'hh:mm:ss.SSS bb',
  'MMMM D, YYYY HH:mm:ss': 'LLLL d, yyyy HH:mm:ss',
  'MMMM D, YYYY hh:mm:ss a': 'LLLL d, yyyy hh:mm:ss bb',
  'dddd, MMMM D, YYYY HH:mm:ss': 'EEEE, LLLL d, yyyy HH:mm:ss',
  'dddd, MMMM D, YYYY hh:mm:ss a': 'EEEE, LLLL d, yyyy hh:mm:ss bb',
}

const getDateFnsFormatString = (format: string): string => {
  const dateFnsFormatString = formatterToDateFnsMap[format]
    ? formatterToDateFnsMap[format]
    : 'yyyy-MM-dd HH:mm:ss'

  return dateFnsFormatString
}

export const isValid = (
  formattedDateTimeString: string,
  format: string
): boolean => {
  const dateFnsFormatString = getDateFnsFormatString(format)

  return isMatch(formattedDateTimeString, dateFnsFormatString)
}
