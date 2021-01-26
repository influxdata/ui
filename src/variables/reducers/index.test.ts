// Reducer
import {variablesReducer} from 'src/variables/reducers'

// Actions
import {moveVariable} from 'src/variables/actions/creators'

// Types
import {RemoteDataState, VariablesState, VariableValues} from 'src/types'

const contextID = '123123'
const initialState = (): VariablesState => ({
  status: RemoteDataState.NotStarted,
  byID: {},
  allIDs: [],
  values: {
    contextID: {
      status: RemoteDataState.NotStarted,
      values: {
        '123': {
          a: 1,
        } as VariableValues,
        '456': {
          a: 2,
        } as VariableValues,
      },
      order: ['123', '456'],
    },
  },
})

describe('Variables Reducer', () => {
  it('can move a variable to the correct order', () => {
    const reorderedVariableState = variablesReducer(
      initialState(),
      moveVariable('123123', ['456', '123'])
    )
    expect(reorderedVariableState.values[contextID].order)
  })
})
