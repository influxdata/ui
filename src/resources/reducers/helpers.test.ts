import {setRelation, setResource} from './helpers'

import {RemoteDataState, ResourceType} from 'src/types'

const genState = () => {
  const childID = 'label_1'
  const parentID = 'user_1'

  return {
    state: {
      byID: {
        [parentID]: {
          id: parentID,
          name: 'u1',

          labels: [],
        },
      },
      allIDs: [parentID],
      status: RemoteDataState.Done,
    },
    childID,
    parentID,
  }
}

const genVariableState = (override = {}) => {
  return {
    status: RemoteDataState.Done,
    byID: {
      foo: {bar: 'baz'},
    },
    allIDs: ['foo'],
    values: {},
    ...override,
  }
}

describe('Resources.reducers.helpers', () => {
  describe('setRelation', () => {
    it('can a relationship with setRelation', () => {
      const {state, parentID, childID} = genState()

      setRelation<any>(state, ResourceType.Labels, childID, parentID)

      const expectedLabels = [childID]
      const expected = {
        ...state,
        byID: {
          ...state.byID,
          [parentID]: {
            ...state.byID[parentID],
            labels: expectedLabels,
          },
        },
      }

      expect(state).toEqual(expected)
    })

    it('does not set any relationship when a parent is not found', () => {
      const {state, childID} = genState()

      setRelation<any>(state, ResourceType.Labels, childID, 'non-existent-id')

      const expected = {
        ...state,
      }

      expect(state).toEqual(expected)
    })

    it('does not set any relationship when a childType is not found', () => {
      const {state, childID} = genState()

      setRelation<any>(
        state,
        ResourceType.Telegrafs,
        childID,
        'non-existent-id'
      )

      const expected = {
        ...state,
      }

      expect(state).toEqual(expected)
    })
  })

  describe('setResource', () => {
    it('updates resources values to be empty if no resource is found under given type', () => {
      const toBeDeletedState = genVariableState()
      const action = {
        schema: {
          entities: {
            variables: {},
          },
          result: [],
        },
        status: 'Done',
      }
      setResource(toBeDeletedState, action, ResourceType.Variables)
      expect(toBeDeletedState).toEqual({
        status: 'Done',
        byID: {},
        allIDs: [],
        values: {},
      })
    })
  })
})
