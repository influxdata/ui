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

// Types
import {BillingProvider} from 'src/types'
import {CurrentIdentity, CurrentOrg} from 'src/identity/apis/auth'

describe('identity reducer', () => {
  it('can initialize a default state', () => {
    const newState = reducer(undefined, setQuartzIdentity(initialState))
    expect(newState).toEqual(initialState)
  })

  it('can change the user identity using quartzIdentity', () => {
    mockIdentities.forEach((identity: CurrentIdentity) => {
      const expectedState = identity
      const actual = reducer(undefined, setQuartzIdentity(identity))
      expect(actual).toEqual(expectedState)
    })
  })
})

describe('billing reducer', () => {
  const identity = reducer(undefined, setQuartzIdentity(mockIdentities[0]))
  it('can set any billing provider', () => {
    mockBillingProviders.forEach((billingProvider: BillingProvider) => {
      const addedProvider = reducer(
        identity,
        setCurrentBillingProvider(billingProvider)
      )
      expect(addedProvider.account.billingProvider).toEqual(billingProvider)
    })
  })
})

describe('organization reducer', () => {
  const identity = reducer(undefined, setQuartzIdentity(mockIdentities[0]))
  it('correctly changes the user organization data', () => {
    mockOrgDetailsArr.forEach((org: CurrentOrg) => {
      const newOrg = reducer(identity, setCurrentOrgDetails(org))
      const expectedOrg = {
        ...omit(identity, 'org'),
        org: org,
      }
      expect(newOrg).toEqual(expectedOrg)
    })
  })
})
