import {convertMillisecondDurationToWindowPeriod} from './fromDuration'
import {SELECTABLE_TIME_RANGES} from 'src/shared/constants/timeRanges'

describe('Getting a windowPeriod number, from time ranges', () => {
  describe('can detect preset selectable timeRange', () => {
    SELECTABLE_TIME_RANGES.forEach(range => {
      it('can provide the proper windowPeriod', () => {
        const actual = convertMillisecondDurationToWindowPeriod(
          range.seconds * 1000
        )
        const expected = range.windowPeriod
        expect(actual).toEqual(expected)
      })
    })
  })
  describe('can calculate based on custom time', () => {
    it('returns a number', () => {
      const actual = convertMillisecondDurationToWindowPeriod(
        Math.floor(Math.random() * 10000)
      )
      expect(Number.isInteger(actual)).toEqual(true)
    })
  })
})
