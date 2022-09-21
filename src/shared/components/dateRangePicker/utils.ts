import {isISODate} from 'src/shared/utils/dateTimeUtils'

import {isValidStrictly} from 'src/utils/datetime/validator'

export const isValidDatepickerFormat = (d: string): boolean => {
  return (
    isValidStrictly(d, 'YYYY-MM-DD HH:mm') ||
    isValidStrictly(d, 'YYYY-MM-DD HH:mm:ss') ||
    isValidStrictly(d, 'YYYY-MM-DD HH:mm:ss.sss') ||
    isValidStrictly(d, 'YYYY-MM-DD') ||
    isISODate(d)
  )
}
