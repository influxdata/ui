import {
  Node,
  Package,
  Property,
  VariableAssignment,
  DurationLiteral,
} from 'src/types'
import {
  WINDOW_PERIOD,
  TIME_RANGE_START,
  TIME_RANGE_STOP,
} from 'src/variables/constants'
import {FALLBACK_WINDOW_PERIOD} from 'src/shared/constants/timeRanges'
import {
  isWindowPeriodVariableNode,
  findNodeScope,
  constructWindowVarAssignmentFromTimes,
} from 'src/shared/utils/ast'

/**
 * Determining the AST subtree for `v.windowPeriod`.
 *
 * @param ast -- root of AST tree, representing a query
 * @param outerContext -- outer context, including any UI defined variables.
 * @returns {{toInject: boolean; node: VariableAssignment}} -- Identified windowPeriod AST node, and if it needs to be injected.
 */
export function getWindowPeriodVariableAssignment(
  ast: Node,
  outerContext: Package
): {toInject: boolean; node: VariableAssignment} {
  const whenFound = (_, acc) => {
    if (
      !acc.scope[`v.${WINDOW_PERIOD}`] &&
      acc.scope[`v.${TIME_RANGE_START}`]
    ) {
      acc.scope[`v.${WINDOW_PERIOD}`] = constructWindowVarAssignmentFromTimes(
        acc.scope,
        acc.scope[`v.${TIME_RANGE_START}`] as Property,
        acc.scope[`v.${TIME_RANGE_STOP}`] as Property | undefined
      )
      acc.toInjectWindowVar = true
    }
    return acc
  }

  const {scope: outerScope} = findNodeScope(
    outerContext,
    _ => false,
    (_, acc) => acc
  )
  const {scope, toInjectWindowVar} = findNodeScope(
    ast,
    isWindowPeriodVariableNode,
    whenFound,
    {
      scope: outerScope,
      halted: false,
    }
  )

  if (scope[`v.${WINDOW_PERIOD}`]) {
    return {
      toInject: !!toInjectWindowVar,
      node: scope[`v.${WINDOW_PERIOD}`] as VariableAssignment,
    }
  }
  return {toInject: false, node: null}
}

/**
 * Determining the `v.windowPeriod` from the AST subtree, then returning only the numeric value.
 * Must always return a numeric value.
 *
 * @param ast -- root of AST tree, representing a query
 * @param outerContext -- outer context, including any UI defined variables.
 * @returns {number} -- numeric value of windowPeriod
 */
export function getWindowPeriodFromAST(
  ast: Node,
  outerContext: Package
): number {
  const {
    node: windowVariableAssignmentNode,
  } = getWindowPeriodVariableAssignment(ast, outerContext)
  if (!windowVariableAssignmentNode) {
    throw new Error('windowPeriod not found in neither query nor outer scope')
  } else if (windowVariableAssignmentNode.init.hasOwnProperty('values')) {
    return (windowVariableAssignmentNode.init as DurationLiteral).values[0]
      .magnitude
  }
  return FALLBACK_WINDOW_PERIOD
}
