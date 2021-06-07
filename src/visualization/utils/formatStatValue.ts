// Types
import {DecimalPlaces} from 'src/types/dashboards'

// Constants
import {MAX_DECIMAL_PLACES} from 'src/visualization/constants'

// Utils
import {preventNegativeZero} from 'src/shared/utils/preventNegativeZero'

interface FormatStatValueOptions {
  decimalPlaces?: DecimalPlaces
  prefix?: string
  suffix?: string
}

const getAutoDigits = (value: number | string): number => {
  const decimalIndex = value.toString().indexOf('.')

  return decimalIndex === -1 ? 0 : 2
}

export const formatStatValue = (
  value: number | string,
  {decimalPlaces, prefix, suffix}: FormatStatValueOptions = {}
): string => {
  let localeFormattedValue: undefined | string | number

  let digits: number

  if (decimalPlaces && decimalPlaces.isEnforced) {
    digits = decimalPlaces.digits
  } else {
    digits = getAutoDigits(value)
  }

  digits = Math.min(digits, MAX_DECIMAL_PLACES)

  if (typeof value === 'number') {
    const [wholeNumber, fractionalNumber] = Number(value)
      .toFixed(digits)
      .split('.')

    localeFormattedValue = Number(wholeNumber).toLocaleString(undefined, {
      maximumFractionDigits: MAX_DECIMAL_PLACES,
    })

    if (fractionalNumber) {
      localeFormattedValue += `.${fractionalNumber}`
    }
  } else if (typeof value === 'string') {
    localeFormattedValue = value
  } else {
    return 'Data cannot be displayed'
  }

  localeFormattedValue = preventNegativeZero(localeFormattedValue)
  const formattedValue = `${prefix || ''}${localeFormattedValue}${suffix || ''}`

  return formattedValue
}
