// Libraries
import {produce} from 'immer'
import {get} from 'lodash'

// Types
import {
  Variable,
  RemoteDataState,
  VariablesState,
  ResourceType,
} from 'src/types'
import {
  Action,
  MOVE_VARIABLE,
  REMOVE_VARIABLE,
  SELECT_VARIABLE_VALUE,
  SET_VARIABLE,
  SET_VARIABLES,
  SET_VARIABLE_HYDRATION_ERROR,
} from 'src/variables/actions/creators'

// Utils
import {setResource, removeResource} from 'src/resources/reducers/helpers'

export const initialState = (): VariablesState => ({
  status: RemoteDataState.NotStarted,
  byID: {},
  allIDs: [],
  values: {},
})

export const variablesReducer = (
  state: VariablesState = initialState(),
  action: Action
): VariablesState =>
  produce(state, draftState => {
    switch (action.type) {
      case SET_VARIABLES: {
        setResource<Variable>(draftState, action, ResourceType.Variables)

        return
      }

      case SET_VARIABLE: {
        const {id, status, schema} = action

        const variable = get(schema, ['entities', 'variables', id])
        const variableExists = !!draftState.byID[id]

        if (variable) {
          draftState.byID[id] = {...variable, status}

          if (!variableExists) {
            draftState.allIDs.push(id)
          }
        } else {
          draftState.byID[id].status = status
        }

        return
      }

      case REMOVE_VARIABLE: {
        removeResource<Variable>(draftState, action)

        return
      }

      case SELECT_VARIABLE_VALUE: {
        const {contextID, variableID, selectedValue} = action

        if (!draftState.values[contextID]) {
          draftState.values[contextID] = {
            status: RemoteDataState.Done,
            order: draftState.allIDs,
            values: {},
          }
        }

        if (!draftState.values[contextID].values[variableID]) {
          draftState.values[contextID].values[variableID] = {
            selected: [selectedValue],
          }

          return
        }

        draftState.values[contextID].values[variableID].selected = [
          selectedValue,
        ]

        return
      }

      case MOVE_VARIABLE: {
        const {contextID, newVariableOrder} = action

        draftState.values[contextID] = {
          ...(draftState.values[contextID] || {
            status: RemoteDataState.NotStarted,
            values: {},
          }),
          order: newVariableOrder,
        }

        return
      }

      case SET_VARIABLE_HYDRATION_ERROR: {
        const {id, errorMessage} = action

        draftState.byID[id].status = RemoteDataState.Error
        draftState.byID[id].errorMessage = errorMessage
        return
      }
    }
  })

export {variableEditorReducer} from 'src/variables/reducers/editor'
