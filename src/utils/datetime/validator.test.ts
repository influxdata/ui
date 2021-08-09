import {isValid} from './validator'

describe('the datetime validator', () => {
  it('should return true on valid date formats', function() {
    expect(isValid('1999-02-09 23:00:00', 'YYYY-MM-DD HH:mm:ss')).toBeTruthy()
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
    expect(isValid('11:00 PM', 'hh:mm a')).toBeTruthy()
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
  it('should return false on invalid date formats', function() {
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
})
