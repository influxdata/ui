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

  const lines = variables
    .map(v => (v.type === 'VariableAssignment' ? v : asAssignment(v)))
    .filter(v => !!v)
    .map(v => `${v.id.name}: ${formatExpression(v.init)}`)

  const option = `option ${OPTION_NAME} = {
  ${lines.join(',\n  ')}
}`

  return option
}
