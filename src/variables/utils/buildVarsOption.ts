// Constants
import {OPTION_NAME} from 'src/variables/constants'

// Types
import {File, Property, VariableAssignment, Variable} from 'src/types'

// Utils
import {filterUnusedVarsBasedOnQuery} from 'src/shared/utils/filterUnusedVars'
import {asAssignmentNode} from 'src/variables/utils/convertVariables'

export const buildUsedVarsOption = (
  query: string | string[],
  allVariables: Variable[],
  variableAssignmentNodesToAppend?: VariableAssignment[]
): File => {
  const filteredVars = filterUnusedVarsBasedOnQuery(
    allVariables,
    Array.isArray(query) ? query : [query]
  )

  const filteredAssignmentVars = filteredVars
    .map(v => asAssignmentNode(v))
    .filter(v => !!v)

  return buildVarsOption([
    ...filteredAssignmentVars,
    ...(variableAssignmentNodesToAppend ?? []),
  ])
}

export const buildVarsOption = (variables: VariableAssignment[]): File => ({
  type: 'File',
  package: null,
  imports: null,
  // only claim namespace `v` if needed
  ...(!variables.length
    ? {body: []}
    : {
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
                properties: variables
                  .filter(v => !!v)
                  .map(assignmentToProperty),
              },
            },
          },
        ],
      }),
})

const assignmentToProperty = (variable: VariableAssignment): Property => {
  return {
    type: 'Property',
    key: variable.id,
    value: variable.init,
  }
}
