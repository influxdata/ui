import {upperFirst} from 'src/shared/utils/upperFirst'

describe('upperFirst', () => {
  const emptyString = ''

  it('handles falsy input gracefully', () => {
    expect(upperFirst(undefined)).toEqual(emptyString)
    expect(upperFirst(null)).toEqual(emptyString)
    expect(upperFirst(emptyString)).toEqual(emptyString)
  })

  it('capitalizes only the first character of a string', () => {
    expect(upperFirst('fred')).toEqual('Fred')
    expect(upperFirst('Fred')).toEqual('Fred')
    expect(upperFirst('fRED')).toEqual('FRED')
    expect(upperFirst('fReDdYzzzzZ')).toEqual('FReDdYzzzzZ')
    expect(upperFirst('f12230')).toEqual('F12230')
    expect(upperFirst('f!43$@#&reddy')).toEqual('F!43$@#&reddy')
  })
})
