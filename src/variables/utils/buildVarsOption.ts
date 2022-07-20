// Constants
import {OPTION_NAME} from 'src/variables/constants'

// Types
import {File, Property, VariableAssignment, Variable} from 'src/types'

// Utils
import {filterUnusedVarsBasedOnQuery} from 'src/shared/utils/filterUnusedVars'

// Selectors
import {asAssignment} from 'src/variables/selectors'

export const buildUsedVarsOption = (
  query: string | string[],
  allVariables: Variable[],
  windowVars?: VariableAssignment[]
): File => {
  const filteredVars = filterUnusedVarsBasedOnQuery(
    allVariables,
    Array.isArray(query) ? query : [query]
  )

  const filteredAssignmentVars = filteredVars
    .map(v => asAssignment(v))
    .filter(v => !!v)

  windowVars = windowVars ?? []
  return buildVarsOption([...filteredAssignmentVars, ...(windowVars ?? [])])
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
