// Reducer
import reducer from 'src/identity/reducers'
import {initialState} from 'src/identity/reducers'
import {omit} from 'lodash'

// Actions
import {setQuartzIdentity} from 'src/identity/actions/creators'

// Mocks
import {mockIdentities} from 'src/identity/mockUserData'

// Types
import {RemoteDataState} from 'src/types'

describe('identity reducer', () => {
  it('can initialize an empty state', () => {
    const emptiedState = {
      ...omit(initialState, ['status']),
      status: RemoteDataState.Done,
    }

    const newState = reducer(
      undefined,
      setQuartzIdentity(emptiedState, RemoteDataState.Done)
    )
    expect(newState).toEqual(emptiedState)
  })

  it('can set user identity using quartzIdentity', () => {
    for (let i = 0; i < mockIdentities.length; i++) {
      const expected = mockIdentities[i]
      const actual = reducer(
        undefined,
        setQuartzIdentity(mockIdentities[i], RemoteDataState.Done)
      )
      expect(actual).toEqual(expected)
    }
  })
})
