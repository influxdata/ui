import {isValid} from './validator'

describe('validation tests', () => {
  it('should do the thing', function() {
    expect(isValid('1999-02-09 23:00:00', 'YYYY-MM-DD HH:mm:ss')).toBeTruthy()
    // expect(isValid('1999-02-09 12:00:00 PM MST', 'YYYY-MM-DD hh:mm:ss a ZZ')).toBeTruthy()
    expect(isValid('09/02/1999 23:00:00.000', 'DD/MM/YYYY HH:mm:ss.sss')).toBeTruthy()
    expect(isValid('09/02/1999 11:00:00.000 PM', 'DD/MM/YYYY hh:mm:ss.sss a')).toBeTruthy()
    expect(isValid('02/09/1999 23:00:00.000', 'MM/DD/YYYY HH:mm:ss.sss')).toBeTruthy()
    expect(isValid('02/09/1999 11:00:00.000 PM', 'MM/DD/YYYY hh:mm:ss.sss a')).toBeTruthy()
    expect(isValid('1999/02/09 23:00:00',  'YYYY/MM/DD HH:mm:ss')).toBeTruthy()
    expect(isValid('1999/02/09 11:00:00 PM',  'YYYY/MM/DD hh:mm:ss a')).toBeTruthy()
    expect(isValid('23:00',  'HH:mm')).toBeTruthy()
  })
})