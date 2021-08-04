import { isMatch } from 'date-fns'
import {DEFAULT_TIME_FORMAT} from '../../shared/constants'
import {createDateTimeFormatter} from './formatters'


const formatterToDateFnsMap: Map<string, string> = new Map([
  [DEFAULT_TIME_FORMAT, 'yyyy-MM-dd HH:mm:ss'],
  ['YYYY-MM-DD hh:mm:ss a ZZ', 'yyyy-MM-dd hh:mm:ss a xxx'], // TBD
  ['DD/MM/YYYY HH:mm:ss.sss', 'dd/MM/yyyy HH:mm:ss.SSS'],
  ['DD/MM/YYYY hh:mm:ss.sss a', 'dd/MM/yyyy hh:mm:ss.SSS bb'],
  ['MM/DD/YYYY HH:mm:ss.sss', 'MM/dd/yyyy HH:mm:ss.SSS'],
  ['MM/DD/YYYY hh:mm:ss.sss a', 'MM/dd/yyyy hh:mm:ss.SSS bb'],
  ['YYYY/MM/DD HH:mm:ss', 'yyyy/MM/dd HH:mm:ss'],
  ['YYYY/MM/DD hh:mm:ss a', 'yyyy/MM/dd hh:mm:ss bb'],
  ['HH:mm', 'HH:mm'],
]);

const getDateFnsFormatString = (format: string): string => {

  const dateFnsFormatString = formatterToDateFnsMap.get(format) ? formatterToDateFnsMap.get(format) : DEFAULT_TIME_FORMAT

  return dateFnsFormatString
}

export const isValid = (formattedDateTimeString: string, format: string): boolean => {
  const dateFnsFormatString = getDateFnsFormatString(format)

  const formatter = createDateTimeFormatter(format)

  console.log(formatter.format(new Date(formattedDateTimeString)))

  return isMatch(formattedDateTimeString, dateFnsFormatString)
}
