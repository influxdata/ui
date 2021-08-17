import {addDurationToDate, isISODate} from './dateTimeUtils'

// July 4th, 1983, 20:00:00 UTC ===> 1983-07-04T20:00:00.000Z
const timestamp = 426196800000

describe('incrementDate', () => {
  it('should add one hour to the time by default when no unit is passed', function() {
    const futureDate = addDurationToDate(new Date(timestamp), 1)

    expect(futureDate.toISOString()).toBe('1983-07-04T21:00:00.000Z')
  })

  it('should be able to add one hour to the time', function() {
    const futureDate = addDurationToDate(new Date(timestamp), 1, 'h')

    expect(futureDate.toISOString()).toBe('1983-07-04T21:00:00.000Z')
  })

  it('should be able to add one minute to the time', function() {
    const futureDate = addDurationToDate(new Date(timestamp), 1, 'm')

    expect(futureDate.toISOString()).toBe('1983-07-04T20:01:00.000Z')
  })

  it('should be able to add one day to the time', function() {
    const futureDate = addDurationToDate(new Date(timestamp), 1, 'd')

    expect(futureDate.toISOString()).toBe('1983-07-05T20:00:00.000Z')
  })

  it('should be able to handle negative value (add negative value = subtract)', function() {
    const futureDate = addDurationToDate(new Date(timestamp), -1, 'd')

    expect(futureDate.toISOString()).toBe('1983-07-03T20:00:00.000Z')
  })
})

describe('isISODate', function() {
  it('should return true for a valid ISO date format', function() {
    expect(isISODate('1983-07-03T20:00:00.000Z')).toBeTruthy()
  })
  it('should return false for an invalid ISO date format', function() {
    expect(isISODate('1983-07-03A20:00:00.000')).toBeFalsy()
  })
  it('should return false for an empty string', function() {
    expect(isISODate('')).toBeFalsy()
  })
})
