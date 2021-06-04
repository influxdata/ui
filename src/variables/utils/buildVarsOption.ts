// Constants
import {OPTION_NAME} from 'src/variables/constants'

// Types
import {File, Property, VariableAssignment} from 'src/types'
import {Variable} from 'src/types/variables'
import {filterUnusedVarsBasedOnQuery} from 'src/shared/utils/filterUnusedVars'
import {asAssignment} from '../selectors'

export const buildUsedVarsOption = (
  query: string | string[],
  allVariables: Variable[],
  windowVars?: VariableAssignment[]
): File => {
  let filteredVars
  if (Array.isArray(query)) {
    filteredVars = filterUnusedVarsBasedOnQuery(allVariables, query)
  } else {
    filteredVars = filterUnusedVarsBasedOnQuery(allVariables, [query])
  }

  const filteredAssignmentVars = filteredVars
    .map(v => asAssignment(v))
    .filter(v => !!v)

  windowVars = windowVars ?? []
  return buildVarsOption([...filteredAssignmentVars, ...windowVars])
}

export const buildVarsOption = (variables: VariableAssignment[]): File => ({
  type: 'File',
  package: null,
  imports: null,
  body: [
    {
      type: 'OptionStatement',
      assignment: {
        type: 'VariableAssignment',
        id: {
          type: 'Identifier',
          name: OPTION_NAME,
        },
        init: {
          type: 'ObjectExpression',
          properties: variables.filter(v => !!v).map(assignmentToProperty),
        },
      },
    },
  ],
})

const assignmentToProperty = (variable: VariableAssignment): Property => {
  return {
    type: 'Property',
    key: variable.id,
    value: variable.init,
  }
}
