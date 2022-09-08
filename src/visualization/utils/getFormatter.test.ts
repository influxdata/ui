import {getFormatter} from './getFormatter'
import {DEFAULT_TIME_FORMAT} from '../../utils/datetime/constants'
import {Base, TimeZone} from '../../types'

// July 4th, 1983, 20:00:00 UTC
const timestamp = 426196800000

describe('getFormatter', () => {
  it("should format correctly for base 10 and 'number' columntype", function () {
    const formatterOptions = {
      prefix: 'prefix ',
      suffix: ' suffix',
      base: '10' as Base,
    }

    const formatter = getFormatter('number', formatterOptions)

    const formattedValue = formatter(100000)

    expect(formattedValue).toBe('prefix 100k suffix')
  })

  it("should format correctly for base '' 'number' columntype", function () {
    const formatterOptions = {
      prefix: 'prefix ',
      suffix: ' suffix',
      base: '' as Base,
    }

    const formatter = getFormatter('number', formatterOptions)

    const formattedValue = formatter(100000)

    expect(formattedValue).toBe('prefix 100000 suffix')
  })

  it("should format correctly for base 2 'number' columntype", function () {
    const formatterOptions = {
      prefix: 'prefix ',
      suffix: ' suffix',
      base: '2' as Base,
    }

    const formatter = getFormatter('number', formatterOptions)

    const formattedValue = formatter(100000)

    expect(formattedValue).toBe('prefix 97.6563 K suffix')
  })

  // time column type
  it('should format correctly for columnType = time, timeFormat = DEFAULT_TIME_FORMAT and timeZone = UTC ', () => {
    const formatterOptions = {
      timeZone: 'UTC' as TimeZone,
      timeFormat: DEFAULT_TIME_FORMAT,
    }

    const formatter = getFormatter('time', formatterOptions)

    const date = new Date(timestamp)

    const formattedTime = formatter(date)

    expect(formattedTime).toBe('1983-07-04 20:00:00')
  })

  it("should format correctly for columnType = time, timeFormat = '' (empty string) and timeZone = UTC ", () => {
    const formatterOptions = {
      timeZone: 'UTC' as TimeZone,
      timeFormat: '',
    }

    const formatter = getFormatter('time', formatterOptions)

    const date = new Date(timestamp)

    const formattedTime = formatter(date)

    expect(formattedTime).toBe('1983-07-04 20:00:00')
  })

  it('should format correctly for columnType = time, timeFormat = undefined and timeZone = UTC ', () => {
    const formatterOptions = {
      timeZone: 'UTC' as TimeZone,
      timeFormat: undefined,
    }

    const formatter = getFormatter('time', formatterOptions)

    const date = new Date(timestamp)

    const formattedTime = formatter(date)

    expect(formattedTime).toBe('1983-07-04 20:00:00')
  })

  it('should format correctly for columnType = time , timeFormat = YYYY-MM-DD hh:mm:ss a ZZ and timeZone = UTC', () => {
    const formatterOptions = {
      timeZone: 'UTC' as TimeZone,
      timeFormat: 'YYYY-MM-DD hh:mm:ss a ZZ',
    }

    const formatter = getFormatter('time', formatterOptions)

    const date = new Date(timestamp)

    const formattedTime = formatter(date)

    expect(formattedTime).toBe('1983-07-04  8:00:00 PM UTC')
  })

  it('should format correctly for columnType = time , timeFormat = YYYY/MM/DD HH:mm:ss and timeZone = UTC', () => {
    const formatterOptions = {
      timeZone: 'UTC' as TimeZone,
      timeFormat: 'YYYY/MM/DD HH:mm:ss',
    }

    const formatter = getFormatter('time', formatterOptions)

    const date = new Date(timestamp)

    const formattedTime = formatter(date)

    expect(formattedTime).toBe('1983/07/04 20:00:00')
  })

  // we will have to skip this test because our CI pipeline is always in UTC
  it.skip('should format correctly for columnType = time , timeFormat = YYYY/MM/DD HH:mm:ss and timeZone = Local', () => {
    const formatterOptions = {
      timeZone: 'Local' as TimeZone,
      timeFormat: 'YYYY/MM/DD HH:mm:ss',
    }

    const formatter = getFormatter('time', formatterOptions)

    const date = new Date(timestamp)

    const formattedTime = formatter(date)

    expect(formattedTime).toBe('1983/07/04 13:00:00')
  })
})
