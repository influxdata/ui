// TODO: handle these any types

import {TimeZone} from 'src/types'

const dateTimeOptions: any = {
  hour12: true,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
}

const timeOptions: any = {
  hour12: true,
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
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

    case 'YYYY-MM-DD hh:mm:ss a': {
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
        hour12: false,
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

    case 'YYYY-MM-DD HH:mm': {
      const options = {
        ...dateTimeOptions,
        hour12: false,
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
        hour12: false,
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
        hour12: false,
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
        hour12: false,
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
        hour12: false,
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
        hour12: false,
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
        hour12: false,
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
        hour12: false,
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
        hour12: false,
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
        hour12: false,
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
