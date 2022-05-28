// APIs
import {parse} from 'src/languageSupport/languages/flux/parser'

// Utils
import {getWindowPeriodVariableAssignment} from 'src/shared/utils/duration'
import {buildVarsOption} from 'src/variables/utils/buildVarsOption'
import {asAssignmentNode} from 'src/variables/utils/convertVariables'

// Constants
import {WINDOW_PERIOD} from 'src/variables/constants'

// Types
import {VariableAssignment} from 'src/types/ast'
import {Variable, Package} from 'src/types'

/*
  Extract the ast node VariableAssignment for `v.windowPeriod`
    * src: in the query
    * or src: calculated using the outer scope time range Variables

  ONLY return node, if toInject.
*/
export const getWindowPeriodVarAssignment = (
  query: string,
  variables: Variable[]
): VariableAssignment[] => {
  if (!query.includes(WINDOW_PERIOD)) {
    return []
  }
  try {
    const varAssignments = variables
      .map(v => asAssignmentNode(v))
      .filter(v => !!v)

    const outerScopeAst: Package = {
      package: '',
      type: 'Package',
      files: [buildVarsOption(varAssignments)],
    }
    const ast = parse(query)
    const {toInject, node: windowPeriodAst} = getWindowPeriodVariableAssignment(
      ast,
      outerScopeAst
    )
    return toInject ? [windowPeriodAst] : []
  } catch (e) {
    console.warn('error', e)
    return null
  }
}
