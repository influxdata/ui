import {createDateTimeFormatter} from 'src/utils/datetime/formatters'

const timestamp = 426196800000

/*
 * supported time formats:
 * see: https://github.com/influxdata/ui/blob/ab5d713b0a95980c9ee8ce8a525f09a15902ec13/src/visualization/utils/timeFormat.ts
  YYYY-MM-DD hh:mm:ss a
  YYYY-MM-DD HH:mm:ss a
  YYYY-MM-DD hh:mm:ss a ZZ
  YYYY-MM-DD HH:mm:ss - UPDATED_AT_TIME_FORMAT
  YYYY-MM-DD HH:mm - TIME_RANGE_FORMAT

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
    it('formats DateTimes in the default time, YYYY-MM-DD hh:mm:ss a in UTC', () => {
      const date = new Date(timestamp)
      let formatter = createDateTimeFormatter('YYYY-MM-DD hh:mm:ss a', 'UTC')
      expect(formatter.format(date)).toBe(`1983-07-04 ${hourUTC}:00:00 PM`)

      formatter = createDateTimeFormatter('YYYY-MM-DD HH:mm:ss', 'UTC')
      expect(formatter.format(date)).toBe(`1983-07-04 ${hourUTC}:00:00`)
    })

    it('formats DateTimes in the format YYYY-MM-DD hh:mm:ss a ZZ in UTC', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter(
        'YYYY-MM-DD hh:mm:ss a ZZ',
        'UTC'
      )
      expect(formatter.format(date)).toBe(`1983-07-04 ${hourUTC}:00:00 PM UTC`)
    })

    it('formats DateTimes in the format YYYY-MM-DD HH:mm:ss in UTC', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('YYYY-MM-DD HH:mm:ss', 'UTC')
      expect(formatter.format(date)).toBe(`1983-07-04 ${hourUTC24}:00:00`)
    })

    it('formats DateTimes in the format YYYY-MM-DD HH:mm in UTC', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('YYYY-MM-DD HH:mm', 'UTC')
      expect(formatter.format(date)).toBe(`1983-07-04 ${hourUTC24}:00`)
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

    it('formats DateTimes in the format YYYY-MM-DD hh:mm:ss a ZZ', () => {
      const date = new Date(timestamp)
      const formatter = createDateTimeFormatter('YYYY-MM-DD hh:mm:ss a ZZ')
      expect(formatter.format(date)).toBe(
        `1983-07-04 ${hour}:00:00 PM ${timeZone}`
      )
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
})
