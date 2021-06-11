import {OPTION_NAME} from 'src/variables/constants/index'
import {formatExpression} from 'src/variables/utils/formatExpression'
import {VariableAssignment, Variable} from 'src/types'
import {asAssignment} from 'src/variables/selectors'

export const formatVarsOption = (
  variables: VariableAssignment[] | Variable[]
): string => {
  if (!variables.length) {
    return ''
  }

  const lines = getAssignmentVariables(variables).map(
    v => `${v.id.name}: ${formatExpression(v.init)}`
  )

  const option = `option ${OPTION_NAME} = {
  ${lines.join(',\n  ')}
}`

  return option
}

const getAssignmentVariables = (
  variables: Variable[] | VariableAssignment[]
): VariableAssignment[] => {
  const assignments = []

  // Looping over instead of map to get around ts interface signature incompatibility error
  variables.forEach(v =>
    v.type === 'VariableAssignment'
      ? assignments.push(v)
      : assignments.push(asAssignment(v))
  )

  return assignments.filter(v => !!v)
}
