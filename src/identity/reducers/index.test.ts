import {RemoteDataState} from 'src/types'
import {cloneDeep} from 'lodash'

// Reducer
import reducer from 'src/identity/reducers'
import {initialState} from 'src/identity/reducers'

// Actions
import {
  setQuartzIdentity,
  setQuartzIdentityStatus,
  setCurrentBillingProvider,
  setCurrentBillingProviderStatus,
  setCurrentOrgDetails,
  setCurrentOrgDetailsStatus,
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
import {CurrentIdentity} from 'src/identity/apis/auth'
import {CurrentOrg} from 'src/identity/apis/org'

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

  it('updates the redux loading state when a status action is dispatched', () => {
    const identity = cloneDeep(mockIdentities[0])

    // Expect to receive an object containing the mocked identity, with its identity loading status set to 'Done'.
    const expected = cloneDeep({
      ...identity,
      loadingStatus: {
        identityStatus: RemoteDataState.Done,
        billingStatus: RemoteDataState.NotStarted,
        orgDetailsStatus: RemoteDataState.NotStarted,
      },
    })

    const updatedIdentity = reducer(undefined, setQuartzIdentity(identity))
    const actualWithUpdatedStatus = reducer(
      updatedIdentity,
      setQuartzIdentityStatus(RemoteDataState.Done)
    )

    expect(actualWithUpdatedStatus).toEqual(expected)
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

  it('updates the redux loading state when a status action is dispatched', () => {
    const billingProvider = cloneDeep(mockBillingProviders[0])
    const addedProvider = reducer(
      identity,
      setCurrentBillingProvider(billingProvider)
    )

    const actualWithUpdatedIdentityStatus = reducer(
      addedProvider,
      setQuartzIdentityStatus(RemoteDataState.Done)
    )
    const actualWithUpdatedBillingStatus = reducer(
      actualWithUpdatedIdentityStatus,
      setCurrentBillingProviderStatus(RemoteDataState.Done)
    )

    // Expect to receive an object containing the mocked identity, with the new billing provider,
    // with its identity and billing loading statuses set to "Done."
    const expected = cloneDeep({
      ...addedProvider,
      loadingStatus: {
        identityStatus: RemoteDataState.Done,
        billingStatus: RemoteDataState.Done,
        orgDetailsStatus: RemoteDataState.NotStarted,
      },
    })

    expect(actualWithUpdatedBillingStatus).toEqual(expected)
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

  it('updates the redux loading state when a status action is dispatched', () => {
    const identityWithUpdatedStatus = reducer(
      identity,
      setQuartzIdentityStatus(RemoteDataState.Done)
    )
    const newOrg = reducer(
      identityWithUpdatedStatus,
      setCurrentOrgDetails(mockOrgDetailsArr[0])
    )
    const newOrgWithUpdatedStatus = reducer(
      newOrg,
      setCurrentOrgDetailsStatus(RemoteDataState.Done)
    )

    // Expect to receive an object containing the mocked identity, with the new org details information,
    // with its identity and org-details loading statuses set to "Done."
    const expected = cloneDeep({
      ...identity,
      org: {...mockOrgDetailsArr[0]},
      loadingStatus: {
        identityStatus: RemoteDataState.Done,
        billingStatus: RemoteDataState.NotStarted,
        orgDetailsStatus: RemoteDataState.Done,
      },
    })

    expect(newOrgWithUpdatedStatus).toEqual(expected)
  })
})
