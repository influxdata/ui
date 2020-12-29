// Reducer
import reducer from 'src/me/reducers'

// Actions
import {setMe} from 'src/me/actions/creators'

// Mocks
import {me} from 'src/me/mockUserData'

describe('me reducer', () => {
  it('can set me', () => {
    const expected = me
    const actual = reducer(undefined, setMe(me))

    expect(actual).toEqual(expected)
  })
})
