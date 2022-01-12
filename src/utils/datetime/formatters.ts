// TODO: handle these any types

import {TimeZone} from 'src/types'
import {STRICT_ISO8061_TIME_FORMAT} from 'src/utils/datetime/constants'

const dateTimeOptions: any = {
  hourCycle: 'h23',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
}

const timeOptions: any = {
  hourCycle: 'h23',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
}

interface Division {
  ms: number
  scale: Intl.RelativeTimeFormatUnit
}

const relativeDivisions: Division[] = [
  {scale: 'years', ms: 31536000000},
  {scale: 'months', ms: 2628000000},
  {scale: 'days', ms: 86400000},
  {scale: 'hours', ms: 3600000},
  {scale: 'minutes', ms: 60000},
  {scale: 'seconds', ms: 1000},
]

export const createRelativeFormatter = (
  numeric: Intl.RelativeTimeFormatNumeric = 'always'
) => {
  const formatter = new Intl.RelativeTimeFormat('en-us', {
    numeric,
  })

  const formatDateRelative = (date: Date) => {
    const millisecondsAgo = date.getTime() - Date.now()

    for (const {scale, ms} of relativeDivisions) {
      if (Math.abs(millisecondsAgo) >= ms || scale === 'seconds') {
        return formatter.format(Math.round(millisecondsAgo / ms), scale)
      }
    }
  }

  return {
    formatRelative: formatDateRelative,
  }
}

export const createDateTimeFormatter = (
  format: string,
  timeZone: TimeZone = 'Local'
) => {
  switch (format) {
    default: {
      if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        console.warn(
          'createDateTimeFormatter: the format argument provided is either invalid or not supported at the moment.'
        )
      }
      break
    }

    case STRICT_ISO8061_TIME_FORMAT: {
      return {
        format: date => date,
      }
    }

    case 'YYYY-MM-DD': {
      const options = {
        ...dateTimeOptions,
      }

      if (timeZone === 'UTC') {
        options.timeZone = 'UTC'
      }
      const formatter = Intl.DateTimeFormat('en-us', options)

      const formatDate = date => {
        const parts = formatter.formatToParts(date)
        const dateParts: any = {}

        parts
          .filter(part => part.type !== 'literal')
          .forEach(part => {
            dateParts[part.type] = part.value
          })

        return `${dateParts.year}-${dateParts.month}-${dateParts.day}`
      }

      return {
        format: formatDate,
      }
    }

    case 'YYYY-MM-DD hh:mm:ss a': {
      const options = {
        ...dateTimeOptions,
        hour12: true,
      }

      if (timeZone === 'UTC') {
        options.timeZone = 'UTC'
      }

      const formatter = Intl.DateTimeFormat('en-us', options)
      const formatDate = date => {
        const parts = formatter.formatToParts(date)
        const dateParts: any = {}

        parts
          .filter(part => part.type !== 'literal')
          .forEach(part => {
            dateParts[part.type] = part.value
          })

        return `${dateParts.year}-${dateParts.month}-${dateParts.day} ${dateParts.hour}:${dateParts.minute}:${dateParts.second} ${dateParts.dayPeriod}`
      }

      return {
        format: formatDate,
      }
    }

    case 'YYYY-MM-DD hh:mm:ss a ZZ': {
      const options = {
        ...dateTimeOptions,
        timeZoneName: 'short',
        hour12: true,
      }

      if (timeZone === 'UTC') {
        options.timeZone = 'UTC'
      }

      const formatter = Intl.DateTimeFormat('en-us', options)

      const formatDate = date => {
        const parts = formatter.formatToParts(date)
        const dateParts: any = {}

        parts
          .filter(part => part.type !== 'literal')
          .forEach(part => {
            dateParts[part.type] = part.value
          })

        return `${dateParts.year}-${dateParts.month}-${dateParts.day} ${dateParts.hour}:${dateParts.minute}:${dateParts.second} ${dateParts.dayPeriod} ${dateParts.timeZoneName}`
      }

      return {
        format: formatDate,
      }
    }

    case 'YYYY-MM-DD HH:mm:ss': {
      const options = {
        ...dateTimeOptions,
      }

      if (timeZone === 'UTC') {
        options.timeZone = 'UTC'
      }
      const formatter = Intl.DateTimeFormat('en-us', options)

      const formatDate = date => {
        const parts = formatter.formatToParts(date)
        const dateParts: any = {}

        parts
          .filter(part => part.type !== 'literal')
          .forEach(part => {
            dateParts[part.type] = part.value
          })

        return `${dateParts.year}-${dateParts.month}-${dateParts.day} ${dateParts.hour}:${dateParts.minute}:${dateParts.second}`
      }

      return {
        format: formatDate,
      }
    }

    case 'YYYY-MM-DD HH:mm:ss.sss': {
      const options = {
        ...dateTimeOptions,
        fractionalSecondDigits: 3,
      }

      if (timeZone === 'UTC') {
        options.timeZone = 'UTC'
      }
      const formatter = Intl.DateTimeFormat('en-us', options)

      const formatDate = date => {
        const parts = formatter.formatToParts(date)
        const dateParts: any = {}

        parts
          .filter(part => part.type !== 'literal')
          .forEach(part => {
            dateParts[part.type] = part.value
          })

        return `${dateParts.year}-${dateParts.month}-${dateParts.day} ${dateParts.hour}:${dateParts.minute}:${dateParts.second}.${dateParts.fractionalSecond}`
      }

      return {
        format: formatDate,
      }
    }

    case 'YYYY-MM-DD HH:mm': {
      const options = {
        ...dateTimeOptions,
      }

      if (timeZone === 'UTC') {
        options.timeZone = 'UTC'
      }
      const formatter = Intl.DateTimeFormat('en-us', options)

      const formatDate = date => {
        const parts = formatter.formatToParts(date)
        const dateParts: any = {}

        parts
          .filter(part => part.type !== 'literal')
          .forEach(part => {
            dateParts[part.type] = part.value
          })

        return `${dateParts.year}-${dateParts.month}-${dateParts.day} ${dateParts.hour}:${dateParts.minute}`
      }

      return {
        format: formatDate,
      }
    }

    case 'DD/MM/YYYY HH:mm:ss.sss': {
      const options = {
        ...dateTimeOptions,
        fractionalSecondDigits: 3,
      }

      if (timeZone === 'UTC') {
        options.timeZone = 'UTC'
      }
      const formatter = Intl.DateTimeFormat('en-us', options)

      const formatDate = date => {
        const parts = formatter.formatToParts(date)
        const dateParts: any = {}

        parts
          .filter(part => part.type !== 'literal')
          .forEach(part => {
            dateParts[part.type] = part.value
          })

        return `${dateParts.day}/${dateParts.month}/${dateParts.year} ${dateParts.hour}:${dateParts.minute}:${dateParts.second}.${dateParts.fractionalSecond}`
      }

      return {
        format: formatDate,
      }
    }

    case 'DD/MM/YYYY hh:mm:ss.sss a': {
      const options = {
        ...dateTimeOptions,
        fractionalSecondDigits: 3,
        hour12: true,
      }

      if (timeZone === 'UTC') {
        options.timeZone = 'UTC'
      }
      const formatter = Intl.DateTimeFormat('en-us', options)

      const formatDate = date => {
        const parts = formatter.formatToParts(date)
        const dateParts: any = {}

        parts
          .filter(part => part.type !== 'literal')
          .forEach(part => {
            dateParts[part.type] = part.value
          })

        return `${dateParts.day}/${dateParts.month}/${dateParts.year} ${dateParts.hour}:${dateParts.minute}:${dateParts.second}.${dateParts.fractionalSecond} ${dateParts.dayPeriod}`
      }

      return {
        format: formatDate,
      }
    }

    case 'MM/DD/YYYY HH:mm:ss.sss': {
      const options = {
        ...dateTimeOptions,
        fractionalSecondDigits: 3,
      }

      if (timeZone === 'UTC') {
        options.timeZone = 'UTC'
      }
      const formatter = Intl.DateTimeFormat('en-us', options)

      const formatDate = date => {
        const parts = formatter.formatToParts(date)
        const dateParts: any = {}

        parts
          .filter(part => part.type !== 'literal')
          .forEach(part => {
            dateParts[part.type] = part.value
          })

        return `${dateParts.month}/${dateParts.day}/${dateParts.year} ${dateParts.hour}:${dateParts.minute}:${dateParts.second}.${dateParts.fractionalSecond}`
      }

      return {
        format: formatDate,
      }
    }

    case 'MM/DD/YYYY hh:mm:ss.sss a': {
      const options = {
        ...dateTimeOptions,
        fractionalSecondDigits: 3,
        hour12: true,
      }

      if (timeZone === 'UTC') {
        options.timeZone = 'UTC'
      }
      const formatter = Intl.DateTimeFormat('en-us', options)

      const formatDate = date => {
        const parts = formatter.formatToParts(date)
        const dateParts: any = {}

        parts
          .filter(part => part.type !== 'literal')
          .forEach(part => {
            dateParts[part.type] = part.value
          })

        return `${dateParts.month}/${dateParts.day}/${dateParts.year} ${dateParts.hour}:${dateParts.minute}:${dateParts.second}.${dateParts.fractionalSecond} ${dateParts.dayPeriod}`
      }

      return {
        format: formatDate,
      }
    }

    case 'YYYY/MM/DD HH:mm:ss': {
      const options = {
        ...dateTimeOptions,
      }

      if (timeZone === 'UTC') {
        options.timeZone = 'UTC'
      }
      const formatter = Intl.DateTimeFormat('en-us', options)

      const formatDate = date => {
        const parts = formatter.formatToParts(date)
        const dateParts: any = {}

        parts
          .filter(part => part.type !== 'literal')
          .forEach(part => {
            dateParts[part.type] = part.value
          })

        return `${dateParts.year}/${dateParts.month}/${dateParts.day} ${dateParts.hour}:${dateParts.minute}:${dateParts.second}`
      }

      return {
        format: formatDate,
      }
    }

    case 'YYYY/MM/DD hh:mm:ss a': {
      const options = {
        ...dateTimeOptions,
        hour12: true,
      }

      if (timeZone === 'UTC') {
        options.timeZone = 'UTC'
      }
      const formatter = Intl.DateTimeFormat('en-us', options)

      const formatDate = date => {
        const parts = formatter.formatToParts(date)
        const dateParts: any = {}

        parts
          .filter(part => part.type !== 'literal')
          .forEach(part => {
            dateParts[part.type] = part.value
          })

        return `${dateParts.year}/${dateParts.month}/${dateParts.day} ${dateParts.hour}:${dateParts.minute}:${dateParts.second} ${dateParts.dayPeriod}`
      }

      return {
        format: formatDate,
      }
    }

    /** ******************  LONG DATE FORMATTING  ********************/

    case 'MMMM D, YYYY HH:mm:ss': {
      const options = {
        ...dateTimeOptions,
        month: 'long',
        day: 'numeric',
      }

      if (timeZone === 'UTC') {
        options.timeZone = 'UTC'
      }
      const formatter = Intl.DateTimeFormat('en-us', options)

      const formatDate = date => {
        const parts = formatter.formatToParts(date)
        const dateParts: any = {}

        parts
          .filter(part => part.type !== 'literal')
          .forEach(part => {
            dateParts[part.type] = part.value
          })

        return `${dateParts.month} ${dateParts.day}, ${dateParts.year} ${dateParts.hour}:${dateParts.minute}:${dateParts.second}`
      }

      return {
        format: formatDate,
      }
    }

    case 'MMMM D, YYYY hh:mm:ss a': {
      const options = {
        ...dateTimeOptions,
        month: 'long',
        day: 'numeric',
        hour12: true,
      }

      if (timeZone === 'UTC') {
        options.timeZone = 'UTC'
      }
      const formatter = Intl.DateTimeFormat('en-us', options)

      const formatDate = date => {
        const parts = formatter.formatToParts(date)
        const dateParts: any = {}

        parts
          .filter(part => part.type !== 'literal')
          .forEach(part => {
            dateParts[part.type] = part.value
          })

        return `${dateParts.month} ${dateParts.day}, ${dateParts.year} ${dateParts.hour}:${dateParts.minute}:${dateParts.second} ${dateParts.dayPeriod}`
      }

      return {
        format: formatDate,
      }
    }

    case 'dddd, MMMM D, YYYY HH:mm:ss': {
      const options = {
        ...dateTimeOptions,
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }

      if (timeZone === 'UTC') {
        options.timeZone = 'UTC'
      }
      const formatter = Intl.DateTimeFormat('en-us', options)

      const formatDate = date => {
        const parts = formatter.formatToParts(date)
        const dateParts: any = {}

        parts
          .filter(part => part.type !== 'literal')
          .forEach(part => {
            dateParts[part.type] = part.value
          })

        return `${dateParts.weekday}, ${dateParts.month} ${dateParts.day}, ${dateParts.year} ${dateParts.hour}:${dateParts.minute}:${dateParts.second}`
      }

      return {
        format: formatDate,
      }
    }

    case 'dddd, MMMM D, YYYY hh:mm:ss a': {
      const options = {
        ...dateTimeOptions,
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour12: true,
      }

      if (timeZone === 'UTC') {
        options.timeZone = 'UTC'
      }
      const formatter = Intl.DateTimeFormat('en-us', options)

      const formatDate = date => {
        const parts = formatter.formatToParts(date)
        const dateParts: any = {}

        parts
          .filter(part => part.type !== 'literal')
          .forEach(part => {
            dateParts[part.type] = part.value
          })

        return `${dateParts.weekday}, ${dateParts.month} ${dateParts.day}, ${dateParts.year} ${dateParts.hour}:${dateParts.minute}:${dateParts.second} ${dateParts.dayPeriod}`
      }

      return {
        format: formatDate,
      }
    }

    /** ******************  TIME FORMATTING  ********************/

    case 'HH:mm': {
      const options = {
        ...timeOptions,
      }

      if (timeZone === 'UTC') {
        options.timeZone = 'UTC'
      }
      const formatter = Intl.DateTimeFormat('en-us', options)

      const formatTime = date => {
        const parts = formatter.formatToParts(date)
        const timeParts: any = {}

        parts
          .filter(part => part.type !== 'literal')
          .forEach(part => {
            timeParts[part.type] = part.value
          })

        return `${timeParts.hour}:${timeParts.minute}`
      }

      return {
        format: formatTime,
      }
    }

    case 'hh:mm a': {
      const options = {
        ...timeOptions,
        hour12: true,
      }

      if (timeZone === 'UTC') {
        options.timeZone = 'UTC'
      }
      const formatter = Intl.DateTimeFormat('en-us', options)

      const formatTime = date => {
        const parts = formatter.formatToParts(date)
        const timeParts: any = {}

        parts
          .filter(part => part.type !== 'literal')
          .forEach(part => {
            timeParts[part.type] = part.value
          })

        return `${timeParts.hour}:${timeParts.minute} ${timeParts.dayPeriod}`
      }

      return {
        format: formatTime,
      }
    }

    case 'HH:mm:ss': {
      const options = {
        ...timeOptions,
      }

      if (timeZone === 'UTC') {
        options.timeZone = 'UTC'
      }
      const formatter = Intl.DateTimeFormat('en-us', options)

      const formatTime = date => {
        const parts = formatter.formatToParts(date)
        const timeParts: any = {}

        parts
          .filter(part => part.type !== 'literal')
          .forEach(part => {
            timeParts[part.type] = part.value
          })

        return `${timeParts.hour}:${timeParts.minute}:${timeParts.second}`
      }

      return {
        format: formatTime,
      }
    }

    case 'hh:mm:ss a': {
      const options = {
        ...timeOptions,
        hour12: true,
      }

      if (timeZone === 'UTC') {
        options.timeZone = 'UTC'
      }
      const formatter = Intl.DateTimeFormat('en-us', options)

      const formatTime = date => {
        const parts = formatter.formatToParts(date)
        const timeParts: any = {}

        parts
          .filter(part => part.type !== 'literal')
          .forEach(part => {
            timeParts[part.type] = part.value
          })

        return `${timeParts.hour}:${timeParts.minute}:${timeParts.second} ${timeParts.dayPeriod}`
      }

      return {
        format: formatTime,
      }
    }

    case 'HH:mm:ss ZZ': {
      const options = {
        ...timeOptions,
        timeZoneName: 'short',
      }

      if (timeZone === 'UTC') {
        options.timeZone = 'UTC'
      }
      const formatter = Intl.DateTimeFormat('en-us', options)

      const formatTime = date => {
        const parts = formatter.formatToParts(date)
        const timeParts: any = {}

        parts
          .filter(part => part.type !== 'literal')
          .forEach(part => {
            timeParts[part.type] = part.value
          })

        return `${timeParts.hour}:${timeParts.minute}:${timeParts.second} ${timeParts.timeZoneName}`
      }

      return {
        format: formatTime,
      }
    }

    case 'hh:mm:ss a ZZ': {
      const options = {
        ...timeOptions,
        timeZoneName: 'short',
        hour12: true,
      }

      if (timeZone === 'UTC') {
        options.timeZone = 'UTC'
      }
      const formatter = Intl.DateTimeFormat('en-us', options)

      const formatTime = date => {
        const parts = formatter.formatToParts(date)
        const timeParts: any = {}

        parts
          .filter(part => part.type !== 'literal')
          .forEach(part => {
            timeParts[part.type] = part.value
          })

        return `${timeParts.hour}:${timeParts.minute}:${timeParts.second} ${timeParts.dayPeriod} ${timeParts.timeZoneName}`
      }

      return {
        format: formatTime,
      }
    }

    case 'HH:mm:ss.sss': {
      const options = {
        ...timeOptions,
        fractionalSecondDigits: 3,
      }

      if (timeZone === 'UTC') {
        options.timeZone = 'UTC'
      }
      const formatter = Intl.DateTimeFormat('en-us', options)

      const formatTime = date => {
        const parts = formatter.formatToParts(date)
        const timeParts: any = {}

        parts
          .filter(part => part.type !== 'literal')
          .forEach(part => {
            timeParts[part.type] = part.value
          })

        return `${timeParts.hour}:${timeParts.minute}:${timeParts.second}.${timeParts.fractionalSecond}`
      }

      return {
        format: formatTime,
      }
    }

    case 'hh:mm:ss.sss a': {
      const options = {
        ...timeOptions,
        fractionalSecondDigits: 3,
        hour12: true,
      }

      if (timeZone === 'UTC') {
        options.timeZone = 'UTC'
      }
      const formatter = Intl.DateTimeFormat('en-us', options)

      const formatTime = date => {
        const parts = formatter.formatToParts(date)
        const timeParts: any = {}

        parts
          .filter(part => part.type !== 'literal')
          .forEach(part => {
            timeParts[part.type] = part.value
          })

        return `${timeParts.hour}:${timeParts.minute}:${timeParts.second}.${timeParts.fractionalSecond} ${timeParts.dayPeriod}`
      }

      return {
        format: formatTime,
      }
    }
  }
}

export const convertDateToRFC3339 = (date: Date, timeZone: string): string => {
  if (!date || date.toDateString() === 'Invalid Date') {
    return date.toDateString()
  }

  if (timeZone === 'Local') {
    const year = date.getFullYear()
    const month =
      date.getMonth() + 1 < 10
        ? `0${date.getMonth() + 1}`
        : `${date.getMonth() + 1}`
    const dayOfMonth =
      date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`

    const timeStringParsed = date.toTimeString().split(' ')
    const localTime = timeStringParsed[0]
    const utcOffset = timeStringParsed[1].replace('GMT', '')

    return `${year}-${month}-${dayOfMonth} ${localTime}${utcOffset}`
  }
  return date.toISOString()
}
