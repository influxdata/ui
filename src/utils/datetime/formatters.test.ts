import {
  convertDateToRFC3339,
  createDateTimeFormatter,
  createRelativeFormatter,
} from 'src/utils/datetime/formatters'

// July 4th, 1983, 20:00:00 UTC
const timestamp = 426196800000

/*
 * supported time formats:
 * see: https://github.com/influxdata/ui/blob/ab5d713b0a95980c9ee8ce8a525f09a15902ec13/src/visualization/utils/timeFormat.ts
  YYYY-MM-DD hh:mm:ss a
  YYYY-MM-DD HH:mm:ss a
  YYYY-MM-DD hh:mm:ss a ZZ
  YYYY-MM-DD HH:mm:ss - UPDATED_AT_TIME_FORMAT
  YYYY-MM-DD HH:mm - TIME_RANGE_FORMAT
  YYYY-MM-DD

  YYYY/MM/DD HH:mm:ss
  YYYY/MM/DD hh:mm:ss a

  DD/MM/YYYY HH:mm:ss.sss
  DD/MM/YYYY hh:mm:ss.sss a
  MM/DD/YYYY HH:mm:ss.sss
  MM/DD/YYYY hh:mm:ss.sss a

  HH:mm
  hh:mm a
  HH:mm:ss
  hh:mm:ss a
  HH:mm:ss ZZ
  hh:mm:ss a ZZ
  HH:mm:ss.sss
  hh:mm:ss.sss a

  MMMM D, YYYY HH:mm:ss
  MMMM D, YYYY hh:mm:ss a
  dddd, MMMM D, YYYY HH:mm:ss
  dddd, MMMM D, YYYY hh:mm:ss a
*/

const isDST = () => {
  const now = new Date()

  const jan = new Date(now.getFullYear(), 0, 1)
  const jul = new Date(now.getFullYear(), 6, 1)

  const standardOffset = Math.max(
    jan.getTimezoneOffset(),
    jul.getTimezoneOffset()
  )
  return now.getTimezoneOffset() < standardOffset
}

describe('the DateTime formatter', () => {
  let timeZone = 'PST'
  let hour = '12'
  const hourUTC = '8'
  let hour24 = '12'
  const hourUTC24 = '20'
  if (isDST()) {
    timeZone = 'PDT'
    hour = '1'
    hour24 = '13'
  }

  describe('formatting DateTimes in UTC', () => {
    it('formats DateTimes in the default time YYYY-MM-DD HH:mm:ss in UTC', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('YYYY-MM-DD HH:mm:ss', 'UTC')
      expect(formatter.format(date)).toBe(`1983-07-04 ${hourUTC24}:00:00`)
    })

    it('formats DateTimes in the default time YYYY-MM-DD HH:mm:ss in UTC, format midnight as 00:00 not 24:00', () => {
      const date = new Date(timestamp)
      date.setHours(date.getHours() + 4) // 20:00 + 4 hrs = Midnight
      const formatter = createDateTimeFormatter('YYYY-MM-DD HH:mm:ss', 'UTC')
      expect(formatter.format(date)).toBe(`1983-07-05 00:00:00`)
    })

    it('formats DateTimes in the format, YYYY-MM-DD in UTC', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('YYYY-MM-DD', 'UTC')
      expect(formatter.format(date)).toBe(`1983-07-04`)
    })

    it('formats DateTimes in the format, YYYY-MM-DD hh:mm:ss a in UTC', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('YYYY-MM-DD hh:mm:ss a', 'UTC')
      expect(formatter.format(date)).toBe(`1983-07-04 ${hourUTC}:00:00 PM`)
    })

    it('formats DateTimes in the format YYYY-MM-DD hh:mm:ss a ZZ in UTC', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter(
        'YYYY-MM-DD hh:mm:ss a ZZ',
        'UTC'
      )
      expect(formatter.format(date)).toBe(`1983-07-04 ${hourUTC}:00:00 PM UTC`)
    })

    it('formats DateTimes in the format YYYY-MM-DD HH:mm in UTC', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('YYYY-MM-DD HH:mm', 'UTC')
      expect(formatter.format(date)).toBe(`1983-07-04 ${hourUTC24}:00`)
    })

    it('formats DateTimes in the format YYYY-MM-DD HH:mm:ss.sss in UTC', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter(
        'YYYY-MM-DD HH:mm:ss.sss',
        'UTC'
      )
      expect(formatter.format(date)).toBe(`1983-07-04 ${hourUTC24}:00:00.000`)
    })

    it('formats DateTimes in the format DD/MM/YYYY HH:mm:ss.sss in UTC', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter(
        'DD/MM/YYYY HH:mm:ss.sss',
        'UTC'
      )
      expect(formatter.format(date)).toBe(`04/07/1983 ${hourUTC24}:00:00.000`)
    })

    it('formats DateTimes in the format DD/MM/YYYY hh:mm:ss.sss a in UTC', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter(
        'DD/MM/YYYY hh:mm:ss.sss a',
        'UTC'
      )
      expect(formatter.format(date)).toBe(`04/07/1983 ${hourUTC}:00:00.000 PM`)
    })

    it('formats DateTimes in the format MM/DD/YYYY HH:mm:ss.sss in UTC', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter(
        'MM/DD/YYYY HH:mm:ss.sss',
        'UTC'
      )
      expect(formatter.format(date)).toBe(`07/04/1983 ${hourUTC24}:00:00.000`)
    })

    it('formats DateTimes in the format MM/DD/YYYY hh:mm:ss.sss a in UTC', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter(
        'MM/DD/YYYY hh:mm:ss.sss a',
        'UTC'
      )
      expect(formatter.format(date)).toBe(`07/04/1983 ${hourUTC}:00:00.000 PM`)
    })

    it('formats DateTimes in the format YYYY/MM/DD HH:mm:ss in UTC', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('YYYY/MM/DD HH:mm:ss', 'UTC')
      expect(formatter.format(date)).toBe(`1983/07/04 ${hourUTC24}:00:00`)
    })

    it('formats DateTimes in the format YYYY/MM/DD hh:mm:ss a in UTC', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('YYYY/MM/DD hh:mm:ss a', 'UTC')
      expect(formatter.format(date)).toBe(`1983/07/04 ${hourUTC}:00:00 PM`)
    })

    it('formats DateTimes in the format MMMM D, YYYY HH:mm:ss in UTC', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('MMMM D, YYYY HH:mm:ss', 'UTC')
      expect(formatter.format(date)).toBe(`July 4, 1983 ${hourUTC24}:00:00`)
    })

    it('formats DateTimes in the format MMMM D, YYYY hh:mm:ss a in UTC', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter(
        'MMMM D, YYYY hh:mm:ss a',
        'UTC'
      )
      expect(formatter.format(date)).toBe(`July 4, 1983 ${hourUTC}:00:00 PM`)
    })

    it('formats DateTimes in the format dddd, MMMM D, YYYY HH:mm:ss in UTC', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter(
        'dddd, MMMM D, YYYY HH:mm:ss',
        'UTC'
      )
      expect(formatter.format(date)).toBe(
        `Monday, July 4, 1983 ${hourUTC24}:00:00`
      )
    })

    it('formats DateTimes in the format dddd, MMMM D, YYYY hh:mm:ss a in UTC', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter(
        'dddd, MMMM D, YYYY hh:mm:ss a',
        'UTC'
      )
      expect(formatter.format(date)).toBe(
        `Monday, July 4, 1983 ${hourUTC}:00:00 PM`
      )
    })
  })

  describe('formatting times without dates in UTC', () => {
    it('formats times in the format HH:mm in UTC', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('HH:mm', 'UTC')
      expect(formatter.format(date)).toBe(`${hourUTC24}:00`)
    })

    it('formats times in the format hh:mm a in UTC', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('hh:mm a', 'UTC')
      expect(formatter.format(date)).toBe(`${hourUTC}:00 PM`)
    })

    it('formats times in the format HH:mm:ss in UTC', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('HH:mm:ss', 'UTC')
      expect(formatter.format(date)).toBe(`${hourUTC24}:00:00`)
    })

    it('formats times in the format hh:mm:ss a in UTC', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('hh:mm:ss a', 'UTC')
      expect(formatter.format(date)).toBe(`${hourUTC}:00:00 PM`)
    })

    it('formats times in the format HH:mm:ss ZZ in UTC', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('HH:mm:ss ZZ', 'UTC')
      expect(formatter.format(date)).toBe(`${hourUTC24}:00:00 UTC`)
    })

    it('formats times in the format hh:mm:ss a ZZ in UTC', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('hh:mm:ss a ZZ', 'UTC')
      expect(formatter.format(date)).toBe(`${hourUTC}:00:00 PM UTC`)
    })

    it('formats times in the format HH:mm:ss.sss in UTC', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('HH:mm:ss.sss', 'UTC')
      expect(formatter.format(date)).toBe(`${hourUTC24}:00:00.000`)
    })

    it('formats times in the format hh:mm:ss.sss a in UTC', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('hh:mm:ss.sss a', 'UTC')
      expect(formatter.format(date)).toBe(`${hourUTC}:00:00.000 PM`)
    })
  })

  // these work locally if you can control the timezone
  describe.skip('formatting DateTimes in local timezones', () => {
    it('formats DateTimes in the default time, YYYY-MM-DD hh:mm:ss a', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('YYYY-MM-DD hh:mm:ss a')
      expect(formatter.format(date)).toBe(`1983-07-04 ${hour}:00:00 PM`)
    })

    it('formats DateTimes in the format YYYY-MM-DD', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('YYYY-MM-DD')
      expect(formatter.format(date)).toBe(`1983-07-04`)
    })

    it('formats DateTimes in the format YYYY-MM-DD hh:mm:ss a ZZ', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('YYYY-MM-DD hh:mm:ss a ZZ')
      expect(formatter.format(date)).toBe(
        `1983-07-04 ${hour}:00:00 PM ${timeZone}`
      )
    })

    it('formats DateTimes in the format YYYY-MM-DD hh:mm:ss.sss', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('YYYY-MM-DD hh:mm:ss.sss')
      expect(formatter.format(date)).toBe(`1983-07-04 ${hour}:00:00.000`)
    })

    it('formats DateTimes in the format DD/MM/YYYY HH:mm:ss.sss', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('DD/MM/YYYY HH:mm:ss.sss')
      expect(formatter.format(date)).toBe(`04/07/1983 ${hour24}:00:00.000`)
    })

    it('formats DateTimes in the format DD/MM/YYYY hh:mm:ss.sss a', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('DD/MM/YYYY hh:mm:ss.sss a')
      expect(formatter.format(date)).toBe(`04/07/1983 ${hour}:00:00.000 PM`)
    })

    it('formats DateTimes in the format MM/DD/YYYY HH:mm:ss.sss', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('MM/DD/YYYY HH:mm:ss.sss')
      expect(formatter.format(date)).toBe(`07/04/1983 ${hour24}:00:00.000`)
    })

    it('formats DateTimes in the format MM/DD/YYYY hh:mm:ss.sss a', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('MM/DD/YYYY hh:mm:ss.sss a')
      expect(formatter.format(date)).toBe(`07/04/1983 ${hour}:00:00.000 PM`)
    })

    it('formats DateTimes in the format YYYY/MM/DD HH:mm:ss', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('YYYY/MM/DD HH:mm:ss')
      expect(formatter.format(date)).toBe(`1983/07/04 ${hour24}:00:00`)
    })

    it('formats DateTimes in the format YYYY/MM/DD hh:mm:ss a', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('YYYY/MM/DD hh:mm:ss a')
      expect(formatter.format(date)).toBe(`1983/07/04 ${hour}:00:00 PM`)
    })

    it('formats DateTimes in the format MMMM D, YYYY HH:mm:ss', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('MMMM D, YYYY HH:mm:ss')
      expect(formatter.format(date)).toBe(`July 4, 1983 ${hour24}:00:00`)
    })

    it('formats DateTimes in the format MMMM D, YYYY hh:mm:ss a', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('MMMM D, YYYY hh:mm:ss a')
      expect(formatter.format(date)).toBe(`July 4, 1983 ${hour}:00:00 PM`)
    })

    it('formats DateTimes in the format dddd, MMMM D, YYYY HH:mm:ss', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('dddd, MMMM D, YYYY HH:mm:ss')
      expect(formatter.format(date)).toBe(
        `Monday, July 4, 1983 ${hour24}:00:00`
      )
    })

    it('formats DateTimes in the format dddd, MMMM D, YYYY hh:mm:ss a', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('dddd, MMMM D, YYYY hh:mm:ss a')
      expect(formatter.format(date)).toBe(
        `Monday, July 4, 1983 ${hour}:00:00 PM`
      )
    })
  })

  describe.skip('formatting times without dates in local time', () => {
    it('formats times in the format HH:mm', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('HH:mm')
      expect(formatter.format(date)).toBe(`${hour24}:00`)
    })

    it('formats times in the format hh:mm a', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('hh:mm a')
      expect(formatter.format(date)).toBe(`${hour}:00 PM`)
    })

    it('formats times in the format HH:mm:ss', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('HH:mm:ss')
      expect(formatter.format(date)).toBe(`${hour24}:00:00`)
    })

    it('formats times in the format hh:mm:ss a', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('hh:mm:ss a')
      expect(formatter.format(date)).toBe(`${hour}:00:00 PM`)
    })

    it('formats times in the format HH:mm:ss ZZ', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('HH:mm:ss ZZ')
      expect(formatter.format(date)).toBe(`${hour24}:00:00 ${timeZone}`)
    })

    it('formats times in the format hh:mm:ss a ZZ', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('hh:mm:ss a ZZ')
      expect(formatter.format(date)).toBe(`${hour}:00:00 PM ${timeZone}`)
    })

    it('formats times in the format HH:mm:ss.sss', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('HH:mm:ss.sss')
      expect(formatter.format(date)).toBe(`${hour24}:00:00.000`)
    })

    it('formats times in the format hh:mm:ss.sss a', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('hh:mm:ss.sss a')
      expect(formatter.format(date)).toBe(`${hour}:00:00.000 PM`)
    })
  })

  describe('convert date to local time in RFC3339 format', () => {
    it('can reject invalid dates', () => {
      expect(convertDateToRFC3339(new Date('abcd'), 'Local')).toEqual(
        'Invalid Date'
      )
      expect(convertDateToRFC3339(new Date('abcd'), 'UTC')).toEqual(
        'Invalid Date'
      )
    })

    it('can use a converted date as the argument to create a valid Date', () => {
      let convertedDateString = convertDateToRFC3339(new Date(), 'Local')
      let date = new Date(convertedDateString)
      expect(date.toDateString()).not.toEqual('Invalid Date')
      expect(() => {
        date.toISOString()
      }).not.toThrow()

      convertedDateString = convertDateToRFC3339(new Date(), 'UTC')
      date = new Date(convertedDateString)
      expect(date.toDateString()).not.toEqual('Invalid Date')
      expect(() => {
        date.toISOString()
      }).not.toThrow()
    })

    it('can use the T as a separator', () => {
      let convertedDateString = convertDateToRFC3339(
        new Date('2022-01-18T17:30:00Z'),
        'Local'
      )
      let date = new Date(convertedDateString)
      expect(date.toDateString()).not.toEqual('Invalid Date')
      expect(() => {
        date.toISOString()
      }).not.toThrow()

      convertedDateString = convertDateToRFC3339(
        new Date('2022-01-19T01:30:00-0800'),
        'UTC'
      )
      date = new Date(convertedDateString)
      expect(date.toDateString()).not.toEqual('Invalid Date')
      expect(() => {
        date.toISOString()
      }).not.toThrow()
    })

    it('can use space as a separator', () => {
      let convertedDateString = convertDateToRFC3339(
        new Date('2022-01-18 17:30:00Z'),
        'Local'
      )
      let date = new Date(convertedDateString)
      expect(date.toDateString()).not.toEqual('Invalid Date')
      expect(() => {
        date.toISOString()
      }).not.toThrow()

      convertedDateString = convertDateToRFC3339(
        new Date('2022-01-19 01:30:00-0800'),
        'UTC'
      )
      date = new Date(convertedDateString)
      expect(date.toDateString()).not.toEqual('Invalid Date')
      expect(() => {
        date.toISOString()
      }).not.toThrow()
    })
  })
})

describe('the relative DateTime formatter', () => {
  describe('comparing past dates', () => {
    it('compares a date to now', () => {
      const mockTimestamp = new Date(timestamp + 35 * 1000).getTime() // timestamp + 35 seconds
      jest.spyOn(Date, 'now').mockReturnValueOnce(mockTimestamp)

      const formatter = createRelativeFormatter()

      const date = new Date(timestamp)
      expect(formatter.formatRelative(date)).toBe('35 seconds ago')
    })

    it('handles minutes', () => {
      const mockTimestamp = new Date(timestamp + 60 * 17 * 1000).getTime() // timestamp + 17 minutes

      jest.spyOn(Date, 'now').mockReturnValueOnce(mockTimestamp)

      const formatter = createRelativeFormatter()

      const date = new Date(timestamp)
      expect(formatter.formatRelative(date)).toBe('17 minutes ago')
    })

    it('handles hours', () => {
      const mockTimestamp = new Date(timestamp + 60 * 60 * 2 * 1000).getTime() // timestamp + 2 hours
      jest.spyOn(Date, 'now').mockReturnValueOnce(mockTimestamp)

      const formatter = createRelativeFormatter()

      const date = new Date(timestamp)
      expect(formatter.formatRelative(date)).toBe('2 hours ago')
    })

    it('handles days', () => {
      const mockTimestamp = new Date(
        timestamp + 60 * 60 * 24 * 5 * 1000
      ).getTime() // timestamp + 5 days
      jest.spyOn(Date, 'now').mockReturnValueOnce(mockTimestamp)

      const formatter = createRelativeFormatter()

      const date = new Date(timestamp)
      expect(formatter.formatRelative(date)).toBe('5 days ago')
    })

    it('says 24 hours is 1 day', () => {
      const mockTimestamp = new Date(timestamp + 60 * 60 * 24 * 1000).getTime() // timestamp + 1 day
      jest.spyOn(Date, 'now').mockReturnValueOnce(mockTimestamp)

      const formatter = createRelativeFormatter()

      const date = new Date(timestamp)
      expect(formatter.formatRelative(date)).toBe('1 day ago')
    })

    it('says 30 days is 30 days not 1 month', () => {
      const mockTimestamp = new Date(
        timestamp + 60 * 60 * 24 * 30 * 1000
      ).getTime() // timestamp + 31 days
      jest.spyOn(Date, 'now').mockReturnValueOnce(mockTimestamp)

      const formatter = createRelativeFormatter()

      const date = new Date(timestamp)
      expect(formatter.formatRelative(date)).toBe('30 days ago')
    })

    it('handles months', () => {
      const mockTimestamp = new Date(
        timestamp + 60 * 60 * 24 * 45 * 1000
      ).getTime() // timestamp + 45 days
      jest.spyOn(Date, 'now').mockReturnValueOnce(mockTimestamp)

      const formatter = createRelativeFormatter()

      const date = new Date(timestamp)
      expect(formatter.formatRelative(date)).toBe('1 month ago')
    })

    it('says 31 days is a month', () => {
      const mockTimestamp = new Date(
        timestamp + 60 * 60 * 24 * 31 * 1000
      ).getTime() // timestamp + 31 days
      jest.spyOn(Date, 'now').mockReturnValueOnce(mockTimestamp)

      const formatter = createRelativeFormatter()

      const date = new Date(timestamp)
      expect(formatter.formatRelative(date)).toBe('1 month ago')
    })

    it('handles years', () => {
      const mockTimestamp = new Date(805159563000).getTime() // July 1995
      jest.spyOn(Date, 'now').mockReturnValueOnce(mockTimestamp)

      const formatter = createRelativeFormatter()

      const date = new Date(timestamp)
      expect(formatter.formatRelative(date)).toBe('12 years ago')
    })

    it('says 365 days is one year', () => {
      const mockTimestamp = new Date(
        timestamp + 60 * 60 * 24 * 365 * 1000
      ).getTime() // timestamp + 365 days
      jest.spyOn(Date, 'now').mockReturnValueOnce(mockTimestamp)

      const formatter = createRelativeFormatter()

      const date = new Date(timestamp)
      expect(formatter.formatRelative(date)).toBe('1 year ago')
    })

    it("handles times that aren't prefectly rounded off to the minute and second", () => {
      const mockTimestamp = new Date(432505644000).getTime() // September 15, 1983 8:27:24

      jest.spyOn(Date, 'now').mockReturnValueOnce(mockTimestamp)

      const formatter = createRelativeFormatter()

      const date = new Date(timestamp)
      expect(formatter.formatRelative(date)).toBe('2 months ago')
    })

    describe('displaying dates in non-numeric mode', () => {
      it('it says "yesterday" rather than "1 day ago"', () => {
        const mockTimestamp = new Date(
          timestamp + 60 * 60 * 24 * 1000
        ).getTime() // timestamp + 1 day
        jest.spyOn(Date, 'now').mockReturnValueOnce(mockTimestamp)

        const formatter = createRelativeFormatter('auto')

        const date = new Date(timestamp)
        expect(formatter.formatRelative(date)).toBe('yesterday')
      })

      it('it says "last month" rather than "35 days ago"', () => {
        const mockTimestamp = new Date(
          timestamp + 60 * 60 * 24 * 35 * 1000
        ).getTime() // timestamp + 35 days
        jest.spyOn(Date, 'now').mockReturnValueOnce(mockTimestamp)

        const formatter = createRelativeFormatter('auto')

        const date = new Date(timestamp)
        expect(formatter.formatRelative(date)).toBe('last month')
      })

      it('it says "last year" rather than "1 year ago"', () => {
        const mockTimestamp = new Date(
          timestamp + 60 * 60 * 24 * 367 * 1000
        ).getTime() // timestamp + 357 days
        jest.spyOn(Date, 'now').mockReturnValueOnce(mockTimestamp)

        const formatter = createRelativeFormatter('auto')

        const date = new Date(timestamp)
        expect(formatter.formatRelative(date)).toBe('last year')
      })
    })
  })
})
