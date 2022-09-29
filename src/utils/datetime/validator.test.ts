import {isValid, isValidRFC3339, isValidStrictly} from './validator'

describe('the datetime validator', () => {
  it('should return true on valid date formats', function () {
    expect(isValid('1999-02-09 23:00:00', 'YYYY-MM-DD HH:mm:ss')).toBeTruthy()
    expect(isValid('1999-02-09', 'YYYY-MM-DD')).toBeTruthy()
    expect(isValid('1999-02-09 23:00', 'YYYY-MM-DD HH:mm')).toBeTruthy()
    expect(isValid('1999-02-09 23:00:00', 'YYYY-MM-DD HH:mm:ss')).toBeTruthy()
    expect(
      isValid('1999-02-09 23:00:00.000', 'YYYY-MM-DD HH:mm:ss.sss')
    ).toBeTruthy()
    expect(
      isValid('1999-02-09 12:00:00 PM -0700', 'YYYY-MM-DD hh:mm:ss a ZZ')
    ).toBeTruthy()
    expect(
      isValid('09/02/1999 23:00:00.000', 'DD/MM/YYYY HH:mm:ss.sss')
    ).toBeTruthy()
    expect(
      isValid('09/02/1999 11:00:00.000 PM', 'DD/MM/YYYY hh:mm:ss.sss a')
    ).toBeTruthy()
    expect(
      isValid('02/09/1999 23:00:00.000', 'MM/DD/YYYY HH:mm:ss.sss')
    ).toBeTruthy()
    expect(
      isValid('02/09/1999 11:00:00.000 PM', 'MM/DD/YYYY hh:mm:ss.sss a')
    ).toBeTruthy()
    expect(isValid('1999/02/09 23:00:00', 'YYYY/MM/DD HH:mm:ss')).toBeTruthy()
    expect(
      isValid('1999/02/09 11:00:00 PM', 'YYYY/MM/DD hh:mm:ss a')
    ).toBeTruthy()
    expect(isValid('23:00', 'HH:mm')).toBeTruthy()
    expect(isValid('9:00 PM', 'hh:mm a')).toBeTruthy()
    expect(isValid('23:00:00', 'HH:mm:ss')).toBeTruthy()
    expect(isValid('11:00:00 PM', 'hh:mm:ss a')).toBeTruthy()
    expect(isValid('23:00:00 -0700', 'HH:mm:ss ZZ')).toBeTruthy()
    expect(isValid('11:00:00 PM -0700', 'hh:mm:ss a ZZ')).toBeTruthy()
    expect(isValid('23:00:00.000', 'HH:mm:ss.sss')).toBeTruthy()
    expect(isValid('11:00:00.000 PM', 'hh:mm:ss.sss a')).toBeTruthy()
    expect(
      isValid('February 9, 1999 23:00:00', 'MMMM D, YYYY HH:mm:ss')
    ).toBeTruthy()
    expect(
      isValid('February 9, 1999 11:00:00 PM', 'MMMM D, YYYY hh:mm:ss a')
    ).toBeTruthy()
    expect(
      isValid(
        'Tuesday, February 9, 1999 23:00:00',
        'dddd, MMMM D, YYYY HH:mm:ss'
      )
    ).toBeTruthy()
    expect(
      isValid(
        'Tuesday, February 9, 1999 11:00:00 PM',
        'dddd, MMMM D, YYYY hh:mm:ss a'
      )
    ).toBeTruthy()
  })

  it('should return false on invalid date formats', function () {
    expect(isValid('1999-02-09 23:00', 'YYYY-MM-DD HH:mm:ss')).toBeFalsy()
    expect(
      isValid('1999-02-09 12:00:00 PM', 'YYYY-MM-DD hh:mm:ss a ZZ')
    ).toBeFalsy()
    expect(
      isValid('09/02/1999 23:00:00', 'DD/MM/YYYY HH:mm:ss.sss')
    ).toBeFalsy()
    expect(
      isValid('09/02/1999 11:00:00.000', 'DD/MM/YYYY hh:mm:ss.sss a')
    ).toBeFalsy()
    expect(
      isValid('02/09/1999 23:00:00', 'MM/DD/YYYY HH:mm:ss.sss')
    ).toBeFalsy()
    expect(
      isValid('02/09/1999 11:00:00.000', 'MM/DD/YYYY hh:mm:ss.sss a')
    ).toBeFalsy()
    expect(isValid('1999/02/09 23:00', 'YYYY/MM/DD HH:mm:ss')).toBeFalsy()
    expect(isValid('1999/02/09 11', 'YYYY/MM/DD hh:mm:ss a')).toBeFalsy()
    expect(isValid('23', 'HH:mm')).toBeFalsy()
    expect(isValid('11:00', 'hh:mm a')).toBeFalsy()
    expect(isValid('23:00', 'HH:mm:ss')).toBeFalsy()
    expect(isValid('11:00', 'hh:mm:ss a')).toBeFalsy()
    expect(isValid('23:00:', 'HH:mm:ss ZZ')).toBeFalsy()
    expect(isValid('11:00:00 ', 'hh:mm:ss a ZZ')).toBeFalsy()
    expect(isValid('23:00:00', 'HH:mm:ss.sss')).toBeFalsy()
    expect(isValid('11:00:00.0', 'hh:mm:ss.sss a')).toBeFalsy()
    expect(
      isValid('February 9, 1999 23:00', 'MMMM D, YYYY HH:mm:ss')
    ).toBeFalsy()
    expect(
      isValid('February 9, 1999 11:00 PM', 'MMMM D, YYYY hh:mm:ss a')
    ).toBeFalsy()
    expect(
      isValid('Tuesday, February 9, 1999 23:00', 'dddd, MMMM D, YYYY HH:mm:ss')
    ).toBeFalsy()
    expect(
      isValid(
        'Tuesday, February 9, 1999 11:00:00',
        'dddd, MMMM D, YYYY hh:mm:ss a'
      )
    ).toBeFalsy()
  })

  it('should be strict on date formats', function () {
    expect(
      isValidStrictly('1999-02-09 23:00:0', 'YYYY-MM-DD HH:mm:ss')
    ).toBeFalsy()
    expect(
      isValidStrictly('1999-02-09 12:00:00 PM -1', 'YYYY-MM-DD hh:mm:ss a ZZ')
    ).toBeFalsy()
    expect(
      isValidStrictly('09/02/1999 23:00:00.0', 'DD/MM/YYYY HH:mm:ss.sss')
    ).toBeFalsy()
    expect(
      isValidStrictly('09/02/1999 11:00:00.000 A', 'DD/MM/YYYY hh:mm:ss.sss a')
    ).toBeFalsy()
    expect(
      isValidStrictly('02/09/1999 23:00:00.00', 'MM/DD/YYYY HH:mm:ss.sss')
    ).toBeFalsy()
    expect(
      isValidStrictly('02/09/1999 11:00:00.000 A', 'MM/DD/YYYY hh:mm:ss.sss a')
    ).toBeFalsy()
    expect(
      isValidStrictly('1999/02/09 23:00:0', 'YYYY/MM/DD HH:mm:ss')
    ).toBeFalsy()
    expect(
      isValidStrictly('1999/02/09 11:00', 'YYYY/MM/DD hh:mm:ss a')
    ).toBeFalsy()
    expect(isValidStrictly('23:0', 'HH:mm')).toBeFalsy()
    expect(isValidStrictly('11:00 A', 'hh:mm a')).toBeFalsy()
    expect(isValidStrictly('23:00:0', 'HH:mm:ss')).toBeFalsy()
    expect(isValidStrictly('11:00:0 A', 'hh:mm:ss a')).toBeFalsy()
    expect(isValidStrictly('23:00:00 -1', 'HH:mm:ss ZZ')).toBeFalsy()
    expect(isValidStrictly('11:00:00 A -1', 'hh:mm:ss a ZZ')).toBeFalsy()
    expect(isValidStrictly('23:00:00.0', 'HH:mm:ss.sss')).toBeFalsy()
    expect(isValidStrictly('11:00:00.0 A', 'hh:mm:ss.sss a')).toBeFalsy()
    expect(
      isValidStrictly('February 9, 1999 23:00:0', 'MMMM D, YYYY HH:mm:ss')
    ).toBeFalsy()
    expect(
      isValidStrictly('February 9, 1999 11:00:0 PM', 'MMMM D, YYYY hh:mm:ss a')
    ).toBeFalsy()
    expect(
      isValidStrictly(
        'Tuesday, February 9, 1999 23:00:0',
        'dddd, MMMM D, YYYY HH:mm:ss'
      )
    ).toBeFalsy()
    expect(
      isValidStrictly(
        'Tuesday, February 9, 1999 11:00:00:0',
        'dddd, MMMM D, YYYY hh:mm:ss a'
      )
    ).toBeFalsy()
  })

  describe('can validate RFC3339 format', () => {
    it('can identify valid RFC3339 format', () => {
      expect(isValidRFC3339(new Date().toISOString())).toBeTruthy()

      expect(isValidRFC3339('2022-01-11T23:00:00Z')).toBeTruthy()
      expect(isValidRFC3339('2022-01-11T00:00:00Z')).toBeTruthy()
      expect(isValidRFC3339('2022-01-11T23:00:00+0800')).toBeTruthy()
      expect(isValidRFC3339('2022-01-11T23:00:00+08:00')).toBeTruthy()
      expect(isValidRFC3339('2022-01-11T23:00:00-0800')).toBeTruthy()
      expect(isValidRFC3339('2022-01-11T23:00:00-08:00')).toBeTruthy()
      expect(isValidRFC3339('2022-01-11T23:00:00+00:00')).toBeTruthy()
      expect(isValidRFC3339('2022-01-11T23:00:00-00:00')).toBeTruthy()
      expect(isValidRFC3339('2022-01-11T23:00:00+0000')).toBeTruthy()
      expect(isValidRFC3339('2022-01-11T23:00:00-0000')).toBeTruthy()
      expect(isValidRFC3339('2022-01-11T23:00:00+10:30')).toBeTruthy()

      expect(isValidRFC3339('2022-01-11 23:00:00Z')).toBeTruthy()
      expect(isValidRFC3339('2022-01-11 00:00:00Z')).toBeTruthy()
      expect(isValidRFC3339('2022-01-11 23:00:00+0800')).toBeTruthy()
      expect(isValidRFC3339('2022-01-11 23:00:00+08:00')).toBeTruthy()
      expect(isValidRFC3339('2022-01-11 23:00:00-0800')).toBeTruthy()
      expect(isValidRFC3339('2022-01-11 23:00:00-08:00')).toBeTruthy()
      expect(isValidRFC3339('2022-01-11 23:00:00+00:00')).toBeTruthy()
      expect(isValidRFC3339('2022-01-11 23:00:00-00:00')).toBeTruthy()
      expect(isValidRFC3339('2022-01-11 23:00:00+0000')).toBeTruthy()
      expect(isValidRFC3339('2022-01-11 23:00:00-0000')).toBeTruthy()
      expect(isValidRFC3339('2022-01-11 23:00:00+10:30')).toBeTruthy()
    })

    it('can identify invalid RFC3339 format', () => {
      expect(isValidRFC3339('22-01-11T23:00:00')).toBeFalsy()
      expect(isValidRFC3339('01-11T23:00:00')).toBeFalsy()
      expect(isValidRFC3339('20220111T230000Z')).toBeFalsy()
      expect(isValidRFC3339('2022-344T23:00:00Z')).toBeFalsy()
      expect(isValidRFC3339('2022-01-11T23:00:00')).toBeFalsy()
      expect(isValidRFC3339('2022-01-11T23:00:00+Z')).toBeFalsy()
      expect(isValidRFC3339('2022-01-11T23:00:00+0')).toBeFalsy()
      expect(isValidRFC3339('2022-01-11T23:00:00+8')).toBeFalsy()

      expect(isValidRFC3339('22-01-11 23:00:00')).toBeFalsy()
      expect(isValidRFC3339('01-11 23:00:00')).toBeFalsy()
      expect(isValidRFC3339('20220111230000Z')).toBeFalsy()
      expect(isValidRFC3339('2022-344 23:00:00Z')).toBeFalsy()
      expect(isValidRFC3339('2022-01-11 23:00:00')).toBeFalsy()
      expect(isValidRFC3339('2022-01-11 23:00:00+Z')).toBeFalsy()
      expect(isValidRFC3339('2022-01-11 23:00:00+0')).toBeFalsy()
      expect(isValidRFC3339('2022-01-11 23:00:00+8')).toBeFalsy()
    })
  })
})
