// Reducer
import reducer from 'src/identity/quartzOrganizations/reducers'
import {initialState} from 'src/identity/quartzOrganizations/reducers'

// Actions
import {
  setQuartzDefaultOrg,
  setQuartzOrganizations,
} from 'src/identity/quartzOrganizations/actions/creators'

// Mocks
import {mockOrgData} from 'src/identity/quartzOrganizations/mockOrgData'

// Types
import {RemoteDataState} from 'src/types'

// Utils
import {cloneDeep} from 'lodash'

describe('identity reducer for quartz organizations', () => {
  describe('loads orgs into state', () => {
    it('initializes a default state', () => {
      const oldState = reducer(
        undefined,
        setQuartzOrganizations(initialState.orgs)
      )
      expect(oldState.orgs).toStrictEqual(initialState.orgs)
    })

    it('initializes a state that includes an array of orgs', () => {
      const oldState = reducer(
        initialState,
        setQuartzOrganizations(mockOrgData)
      )

      expect(oldState.orgs).toStrictEqual(mockOrgData)
    })

    it('sets a `Done` state when the organization array is loaded into state', () => {
      const newState = reducer(undefined, setQuartzOrganizations(mockOrgData))

      expect(newState.status).toEqual(RemoteDataState.Done)
    })
  })

  describe('changes default orgs', () => {
    let oldState

    beforeEach(() => {
      oldState = reducer(initialState, setQuartzOrganizations(mockOrgData))
    })

    describe('changes which org is the default org', () => {
      it('sets a new org as the `default` org', () => {
        const newDefaultOrg = oldState.orgs[1]

        const newState = reducer(
          oldState,
          setQuartzDefaultOrg(newDefaultOrg.id)
        )

        expect(newState.orgs[0].isDefault).toEqual(false)
        expect(newState.orgs[1].isDefault).toEqual(true)
      })

      it('sets one - and only one - default org at once', () => {
        let currentState = oldState

        mockOrgData.forEach(org => {
          const nextOrgId = org.id
          currentState = reducer(currentState, setQuartzDefaultOrg(nextOrgId))

          const numDefaultOrgs = currentState.orgs.reduce((acc, org) => {
            return org.isDefault === true ? acc + 1 : acc
          }, 0)

          expect(numDefaultOrgs).toEqual(1)
        })
      })
    })

    it('leaves state unchanged if the `new` default org `is` the existing default', () => {
      const newOrgId = mockOrgData[0].id
      const newState = reducer(oldState, setQuartzDefaultOrg(newOrgId))

      expect(oldState).toStrictEqual(newState)
    })
  })

  describe('sets an appropriate `status` based on whether or not the new default org could be set', () => {
    let oldState

    beforeEach(() => {
      oldState = reducer(undefined, setQuartzOrganizations(mockOrgData))
    })

    it('sets a `Done` state if the current default org was updated', () => {
      const newId = mockOrgData[2].id
      const newState = reducer(oldState, setQuartzDefaultOrg(newId))

      expect(newState.status).toEqual(RemoteDataState.Done)
    })

    it('sets an `Error` state if the current default org was `not` updated', () => {
      const newId = 'fake id'
      const newState = reducer(oldState, setQuartzDefaultOrg(newId))

      expect(newState.status).toEqual(RemoteDataState.Error)
    })

    it('sets an `Error` state if there is no existing `default` org', () => {
      const mockOrgClone = cloneDeep(mockOrgData)
      mockOrgClone[0].isDefault = false

      const newOrgId = mockOrgClone[3].id

      oldState = reducer(oldState, setQuartzOrganizations(mockOrgClone))
      const newState = reducer(oldState, setQuartzDefaultOrg(newOrgId))

      expect(newState.status).toEqual(RemoteDataState.Error)
      expect(newState.orgs[0].isDefault).toEqual(false)
      expect(newState.orgs[3].isDefault).toEqual(false)
    })
  })
})
