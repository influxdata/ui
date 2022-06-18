import {RemoteDataState} from '@influxdata/clockface'

// APIs
import {parse} from 'src/languageSupport/languages/flux/parser'

// Utils
import {
  getWindowPeriodVariableAssignment,
  getDurationFromAST,
} from 'src/shared/utils/duration'
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
    console.warn(e)
    return null
  }
}

/*
  Same as above, except need a Variable type returned.
    * This is legacy:
        * We do not want the UI to have a windowPeriod Variable.
        * Instead, we only create windowPeriod as an AST node (variable assignment) to time-of-use.
    * However, notebooks is on legacy code:
        * Uses the windowPeriod Variable.
        * Must have an exact duration value, not an AST expression node.
*/
export const getWindowPeriodVariable = (
  query: string,
  variables: Variable[]
): Variable[] => {
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
    const duration: number = getDurationFromAST(ast, outerScopeAst)
    return [
      {
        orgID: '',
        id: WINDOW_PERIOD,
        name: WINDOW_PERIOD,
        arguments: {
          type: 'system',
          values: [duration],
        },
        status: RemoteDataState.Done,
        labels: [],
      },
    ]
  } catch (e) {
    console.warn(e)
  }
}
