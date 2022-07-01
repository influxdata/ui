import {getWindowPeriodDurationFromTimeRange} from './fromTimeRange'
import {millisecondsToDuration} from 'src/shared/utils/duration'
import {SELECTABLE_TIME_RANGES} from 'src/shared/constants/timeRanges'
import {TimeRange} from 'src/types'

describe('Getting a windowPeriod duration string, from time ranges', () => {
  describe('can detect preset selectable timeRange', () => {
    SELECTABLE_TIME_RANGES.forEach(range => {
      it('returns the windowPeriod, as a duration', () => {
        const actual = getWindowPeriodDurationFromTimeRange(range)
        const expected = millisecondsToDuration(range.windowPeriod)
        expect(actual).toEqual(expected)
      })
    })
  })

  describe('can calculate based on custom time', () => {
    const range = {
      type: 'custom',
      lower: '2022-07-01T01:00:00.501Z',
      upper: '2022-07-01T04:00:00.501Z',
    } as TimeRange
    it('returns the correct string duration', () => {
      const actual = getWindowPeriodDurationFromTimeRange(range)
      const expected = millisecondsToDuration(60000) // "1m"
      expect(expected).toEqual(actual)
    })
  })

  describe('can calculate based on a duration timeRange', () => {
    const range = {
      type: 'duration',
      lower: 'now() - 3h',
    } as TimeRange
    it('returns the correct string duration', () => {
      const actual = getWindowPeriodDurationFromTimeRange(range)
      const expected = millisecondsToDuration(60000) // "1m"
      expect(expected).toEqual(actual)
    })
  })
})
