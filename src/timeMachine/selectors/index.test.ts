import {
  getStartTime,
  getEndTime,
  handleCustomTime,
} from 'src/timeMachine/selectors/index'
import moment from 'moment'

import {
  pastThirtyDaysTimeRange,
  pastHourTimeRange,
  pastFifteenMinTimeRange,
} from 'src/shared/constants/timeRanges'

const custom = 'custom' as 'custom'

describe('TimeMachine.Selectors.Index', () => {
  describe('getStartTime and getEndTime', () => {
    const thirty = moment()
      .subtract(30, 'days')
      .subtract(moment().isDST() ? 1 : 0, 'hours') // added to account for DST
      .valueOf()
    it(`getStartTime should return ${thirty} when lower is now() - 30d`, () => {
      expect(getStartTime(pastThirtyDaysTimeRange)).toBeGreaterThanOrEqual(
        thirty
      )
    })

    const hour = moment().subtract(1, 'hours').valueOf()
    it(`getStartTime should return ${hour} when lower is now() - 1h`, () => {
      expect(getStartTime(pastHourTimeRange)).toBeGreaterThanOrEqual(hour)
    })

    const fifteen = moment().subtract(15, 'minutes').valueOf()
    it(`getStartTime should return ${hour} when lower is now() - 1h`, () => {
      expect(getStartTime(pastFifteenMinTimeRange)).toBeGreaterThanOrEqual(
        fifteen
      )
    })

    const date = '2019-01-01'
    const newYears = new Date(date).valueOf()
    it(`getStartTime should return ${newYears} when lower is ${date}`, () => {
      const timeRange = {
        type: custom,
        lower: date,
        upper: date,
      }
      expect(getStartTime(timeRange)).toEqual(newYears)
    })

    it(`getEndTime should return ${newYears} when lower is ${date}`, () => {
      const timeRange = {
        type: custom,
        lower: date,
        upper: date,
      }
      expect(getEndTime(timeRange)).toEqual(newYears)
    })

    const now = new Date().valueOf()
    it(`getEndTime should return ${now} when upper is null and lower includes now()`, () => {
      expect(getEndTime(pastThirtyDaysTimeRange)).toBeGreaterThanOrEqual(now)
    })
  })

  describe('handleCustomTime', () => {
    const now = new Date()
    const threeDays = 1000 * 60 * 60 * 24 * 3
    const twentyFourHours = 1000 * 60 * 60 * 24
    const fifteenMinutes = 1000 * 60 * 15
    const oneMillisecond = 1

    it('can parse just "now"', () => {
      expect(handleCustomTime('now()', now)).toEqual(now.getTime())
    })

    it('can parse now() and a duration', () => {
      expect(handleCustomTime('now() - 3d', now)).toEqual(
        now.getTime() - threeDays
      )
      expect(handleCustomTime('now() + 3d', now)).toEqual(
        now.getTime() + threeDays
      )

      expect(handleCustomTime('now() - 24h', now)).toEqual(
        now.getTime() - twentyFourHours
      )
      expect(handleCustomTime('now() + 24h', now)).toEqual(
        now.getTime() + twentyFourHours
      )

      expect(handleCustomTime('now() - 15m', now)).toEqual(
        now.getTime() - fifteenMinutes
      )
      expect(handleCustomTime('now() + 15m', now)).toEqual(
        now.getTime() + fifteenMinutes
      )

      expect(handleCustomTime('now() - 1ms', now)).toEqual(
        now.getTime() - oneMillisecond
      )
      expect(handleCustomTime('now() + 1ms', now)).toEqual(
        now.getTime() + oneMillisecond
      )
    })

    it('can parse a duration without now()', () => {
      expect(handleCustomTime('-3d', now)).toEqual(now.getTime() - threeDays)
      expect(handleCustomTime('+3d', now)).toEqual(now.getTime() + threeDays)

      expect(handleCustomTime('-24h', now)).toEqual(
        now.getTime() - twentyFourHours
      )
      expect(handleCustomTime('+24h', now)).toEqual(
        now.getTime() + twentyFourHours
      )

      expect(handleCustomTime('-15m', now)).toEqual(
        now.getTime() - fifteenMinutes
      )
      expect(handleCustomTime('+15m', now)).toEqual(
        now.getTime() + fifteenMinutes
      )

      expect(handleCustomTime('-1ms', now)).toEqual(
        now.getTime() - oneMillisecond
      )
      expect(handleCustomTime('+1ms', now)).toEqual(
        now.getTime() + oneMillisecond
      )
    })

    it('can ignore spaces around now and the sign correctly', () => {
      expect(handleCustomTime(' now()', now)).toEqual(now.getTime())
      expect(handleCustomTime('now() ', now)).toEqual(now.getTime())
      expect(handleCustomTime('        now()  ', now)).toEqual(now.getTime())

      expect(handleCustomTime(' now() -   3d', now)).toEqual(
        now.getTime() - threeDays
      )
      expect(handleCustomTime('now()+   3d   ', now)).toEqual(
        now.getTime() + threeDays
      )

      expect(handleCustomTime('-   24h', now)).toEqual(
        now.getTime() - twentyFourHours
      )
      expect(handleCustomTime('           +  24h', now)).toEqual(
        now.getTime() + twentyFourHours
      )

      expect(handleCustomTime(' 15m', now)).toEqual(
        now.getTime() + fifteenMinutes
      )
      expect(handleCustomTime('15m          ', now)).toEqual(
        now.getTime() + fifteenMinutes
      )
      expect(handleCustomTime('    15m          ', now)).toEqual(
        now.getTime() + fifteenMinutes
      )
    })

    it('can parse a JavaScript timestamp as a string', () => {
      let specificTimeString: string = '2022-10-14T20:33:01.433Z'
      expect(handleCustomTime(specificTimeString, now)).toEqual(
        new Date(specificTimeString).getTime()
      )

      specificTimeString = '2022/07/04'
      expect(handleCustomTime(specificTimeString, now)).toEqual(
        new Date(specificTimeString).getTime()
      )

      specificTimeString = '2022-10-06 00:00'
      expect(handleCustomTime(specificTimeString, now)).toEqual(
        new Date(specificTimeString).getTime()
      )
    })
  })
})
