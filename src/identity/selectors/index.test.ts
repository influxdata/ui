// Mocks
import {emptyOrg} from 'src/identity/components/GlobalHeader/DefaultEntities'
import {mockOrgData} from 'src/identity/quartzOrganizations/mockOrgData'

// Selectors
import {selectQuartzActiveOrgs} from 'src/identity/selectors'

// Types
import {AppState, RemoteDataState} from 'src/types'
import {state} from 'src/client/unityRoutes'

// Utilities
import {cloneDeep} from 'lodash'

const mockState = {
  identity: {
    quartzOrganizations: {
      orgs: cloneDeep(mockOrgData),
      status: RemoteDataState.Done,
    },
  },
} as AppState

describe('selectQuartzActiveOrgs selector', () => {
  let localState: AppState

  beforeEach(() => {
    localState = cloneDeep(mockState)
  })

  it('returns an array of length one with the default empty org', () => {
    localState.identity.quartzOrganizations.orgs = [emptyOrg]
    const activeOrgs = selectQuartzActiveOrgs(localState)

    expect(activeOrgs.length).toBe(1)
    expect(activeOrgs).toEqual(expect.arrayContaining([emptyOrg]))
  })

  it('returns an array of all orgs in a `provisioned` state', () => {
    const activeOrgs = selectQuartzActiveOrgs(localState)
    expect(activeOrgs.length).toBe(5)
    expect(activeOrgs).toEqual(expect.arrayContaining(mockOrgData))
  })

  it('returns an array that includes orgs without a state property', () => {
    localState.identity.quartzOrganizations.orgs[0].state = '' as state // Return this org
    localState.identity.quartzOrganizations.orgs[1].state =
      'random new state' as state // Dont return this org

    const activeOrgs = selectQuartzActiveOrgs(localState)

    expect(activeOrgs.length).toBe(4)
    expect(activeOrgs.map(org => org.name)).toEqual(
      expect.arrayContaining([
        'Test Co. 1',
        'Test GmbH 3',
        'Test Inc. 4',
        'Test SA 5',
      ])
    )
  })

  it('does not return orgs that are marked as unprovisioned', () => {
    localState.identity.quartzOrganizations.orgs[0].state = 'suspended'
    localState.identity.quartzOrganizations.orgs[1].state = 'pending'

    const activeOrgs = selectQuartzActiveOrgs(localState)

    expect(activeOrgs.length).toBe(3)
    expect(activeOrgs.map(org => org.name)).toEqual(
      expect.arrayContaining(['Test GmbH 3', 'Test Inc. 4', 'Test SA 5'])
    )
  })
})
