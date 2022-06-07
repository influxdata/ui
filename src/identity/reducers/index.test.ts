/**

export const setQuartzIdentity = (
  identity: QuartzIdentityState,
  status: RemoteDataState
) =>
  ({
    type: SET_QUARTZ_IDENTITY,
    identity: identity,
    status,
  } as const)

export const setQuartzIdentityStatus = (status: RemoteDataState) =>
  ({
    type: SET_QUARTZ_IDENTITY_STATUS,
    status,
  } as const)

**/

// Reducer
// import reducer from 'src/identity/reducers'

// Actions
import {setIdentity} from 'src/identity/actions/creators'

// Mocks
import {mockIdentities} from 'src/identity/mockUserData'

describe('identity reducer', () => {
  it('can set the user identity using quartzIdentity, instead of quartzMe', () => {
    for (let i = 0; i < mockIdentities.identities.length; i++) {
      const expected = mockIdentities.identities[i]
      const actual = reducer(
        undefined,
        setIdentity(mockIdentities.identities[i])
      )
      expect(actual).toEqual(expected)
    }
  })
})
