import {rangeToInterval} from 'src/shared/utils/sqlInterval'
import {SELECTABLE_TIME_RANGES} from 'src/shared/constants/timeRanges'
import {DurationTimeRange} from 'src/types'

describe('rangeToInterval:', () => {
  describe('handles selectable timeRanges', () => {
    SELECTABLE_TIME_RANGES.forEach(range => {
      it(`handles ${range.label}`, () => {
        expect(rangeToInterval(range)).toEqual(range.sql)
      })
    })
  })
  describe('handles duration timeRanges', () => {
    const toTest = [
      {
        msg: 'for all units',
        input: {
          lower: '-12y11mo10w9d8h7m6s5ms4us3µs2ns',
          upper: 'now()',
          type: 'duration',
        },
        expected: `time >= now() - interval '12 year 11 month 10 week 9 day 8 hour 7 minute 6 second 5 millisecond 0.004 millisecond 0.003 millisecond 0.000002 millisecond' AND time <= now()`,
      },
      {
        msg: 'for single durations',
        input: {lower: '-8h', upper: 'now()', type: 'duration'},
        expected: `time >= now() - interval '8 hour' AND time <= now()`,
      },
      {
        msg: 'for durations without upper bounds',
        input: {lower: '-8h', upper: null, type: 'duration'},
        expected: `time >= now() - interval '8 hour' AND time <= now()`,
      },
      {
        msg: 'for durations which are not negative (into the future)',
        input: {lower: 'now()', upper: '8h', type: 'duration'},
        expected: `time >= now() AND time <= now() + interval '8 hour'`,
      },
    ]
    toTest.forEach(({msg, input, expected}) => {
      it(msg, () => {
        expect(rangeToInterval(input as DurationTimeRange)).toEqual(expected)
      })
    })
  })
  describe('handles timestamp timeRanges', () => {
    const toTest = [
      {
        msg: 'when provided without timezones',
        input: {
          lower: '2023-01-03 00:00Z',
          upper: '2023-01-04 23:59Z',
          type: 'custom',
        },
        expected: `time >= timestamp '2023-01-03T00:00:00.000Z' AND time <= timestamp '2023-01-04T23:59:00.000Z'`,
      },
      {
        msg: 'for timestamps without upper bounds',
        input: {
          lower: '2023-01-03 00:00Z',
          upper: null,
          type: 'custom',
        },
        expected: `time >= timestamp '2023-01-03T00:00:00.000Z' AND time <= now()`,
      },
      // TODO -- this is what the new datePicker places in persistence context. No timezone. Will Fail.
      // {
      //   msg: 'for timestamps without upper bounds',
      //   input: {
      //     lower: '2023-01-03 00:00',
      //     upper: null,
      //     type: 'custom',
      //   },
      //   expected: `time >= timestamp '2023-01-03T08:00:00.000Z' AND time <= now()`,
      // },
    ]
    toTest.forEach(({msg, input, expected}) => {
      it(msg, () => {
        expect(rangeToInterval(input as DurationTimeRange)).toEqual(expected)
      })
    })
  })
})
