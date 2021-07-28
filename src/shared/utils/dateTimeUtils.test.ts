import {addDurationToDate} from './dateTimeUtils'

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
