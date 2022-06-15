// Reducer
import reducer from 'src/identity/reducers'
import {initialState} from 'src/identity/reducers'

// Actions
import {
  setQuartzIdentity,
  setCurrentBillingProvider,
  setCurrentOrgDetails,
} from 'src/identity/actions/creators'

// Mocks
import {
  mockIdentities,
  mockBillingProviders,
  mockOrgDetailsArr,
} from 'src/identity/mockUserData'

// Utils
import {omit} from 'lodash'

describe('identity reducer', () => {
  it('can initialize a default state', () => {
    const newState = reducer(undefined, setQuartzIdentity(initialState))
    expect(newState).toEqual(initialState)
  })

  it('can change the user identity using quartzIdentity', () => {
    for (let i = 0; i < mockIdentities.length; i++) {
      const expectedState = mockIdentities[i]
      const actual = reducer(undefined, setQuartzIdentity(mockIdentities[i]))
      expect(actual).toEqual(expectedState)
    }
  })
})

describe('billing reducer', () => {
  const identity = reducer(undefined, setQuartzIdentity(mockIdentities[0]))
  it('can set any billing provider', () => {
    for (let i = 0; i < mockBillingProviders.length; i++) {
      const addedProvider = reducer(
        identity,
        setCurrentBillingProvider(mockBillingProviders[i])
      )
      expect(addedProvider.account.billingProvider).toEqual(
        mockBillingProviders[i]
      )
    }
  })
})

describe('organization reducer', () => {
  const identity = reducer(undefined, setQuartzIdentity(mockIdentities[0]))
  it('correctly changes the user organization data', () => {
    for (let i = 0; i < mockOrgDetailsArr.length; i++) {
      const newOrg = reducer(
        identity,
        setCurrentOrgDetails(mockOrgDetailsArr[i])
      )
      const expectedOrg = {
        ...omit(identity, 'org'),
        org: mockOrgDetailsArr[i],
      }
      expect(newOrg).toEqual(expectedOrg)
    }
  })
})
