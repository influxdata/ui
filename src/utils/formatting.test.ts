import {Duration, ruleToString} from './formatting'

const tests: [Duration, string][] = [
  [{days: 0, hours: 0, minutes: 0, seconds: 20}, '20 seconds'],
  [{days: 0, hours: 0, minutes: 5, seconds: 20}, '5 minutes 20 seconds'],
  [{days: 0, hours: 0, minutes: 5, seconds: 0}, '5 minutes'],
  [{days: 0, hours: 20, minutes: 0, seconds: 0}, '20 hours'],
  [{days: 0, hours: 20, minutes: 0, seconds: 7}, '20 hours 7 seconds'],
  [
    {days: 8, hours: 12, minutes: 4, seconds: 36},
    '8 days 12 hours 4 minutes 36 seconds',
  ],
  [
    {days: 12, hours: 3, minutes: 23, seconds: 0},
    '12 days 3 hours 23 minutes',
  ],
]

const durationToSeconds = ({days, hours, minutes, seconds}: Duration) =>
  ((days * 24 + hours) * 60 + minutes) * 60 + seconds

describe('utils formating', () => {
  it("should return 'forever' when duration is 0", () => {
    expect(ruleToString(0)).toBe('forever')
  })

  it('should format arbitrary duration', () => {
    tests.forEach(([duration, expected]) => {
      const seconds = durationToSeconds(duration)

      expect(ruleToString(seconds)).toBe(expected)
    })
  })
})
