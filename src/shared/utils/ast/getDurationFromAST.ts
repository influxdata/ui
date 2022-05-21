import {Node, Property, VariableAssignment, DurationLiteral} from 'src/types'
import {
  WINDOW_PERIOD,
  TIME_RANGE_START,
  TIME_RANGE_STOP,
} from 'src/variables/constants'
import {FALLBACK_WINDOW_PERIOD} from 'src/shared/constants/timeRanges'
import {isWindowPeriodVariableNode} from 'src/shared/utils/ast/nodes'
import {findNodeScope} from 'src/shared/utils/ast/visitors'
import {constructWindowVarAssignmentFromTimes} from 'src/shared/utils/ast/constructWindowVar'

/*
  Determining the AST subtree for `v.windowPeriod`:
    * construction of optionASTs
    * for sending to LSP, or in query construction (for backend)
*/
export function getWindowPeriodVariableAssignment(
  ast: Node,
  outerContext: Node
): VariableAssignment {
  const whenFound = (_, acc) => {
    if (
      !acc.scope[`v.${WINDOW_PERIOD}`] &&
      acc.scope[`v.${TIME_RANGE_START}`]
    ) {
      acc.scope[`v.${WINDOW_PERIOD}`] = constructWindowVarAssignmentFromTimes(
        acc.scope[`v.${TIME_RANGE_START}`] as Property,
        acc.scope[`v.${TIME_RANGE_STOP}`] as Property | undefined
      )
    }
    return acc
  }

  const {scope: outerScope} = findNodeScope(
    outerContext,
    _ => false,
    (_, acc) => acc
  )
  const {scope} = findNodeScope(ast, isWindowPeriodVariableNode, whenFound, {
    scope: outerScope,
    halted: false,
  })

  if (scope[`v.${WINDOW_PERIOD}`]) {
    return scope[`v.${WINDOW_PERIOD}`] as VariableAssignment
  }
  return null
}

/*
  Determining a set duration value for `v.windowPeriod`:
    * when a number must be returned
    * used in the outer UI window (scope outside editor)
*/
export function getDurationFromAST(ast: Node, outerContext: Node): number {
  const windowVariableAssignmentNode = getWindowPeriodVariableAssignment(
    ast,
    outerContext
  )
  if (!windowVariableAssignmentNode) {
    throw new Error('windowPeriod not found in neither query nor outer scope')
  } else if (windowVariableAssignmentNode.init.hasOwnProperty('values')) {
    return (windowVariableAssignmentNode.init as DurationLiteral).values[0]
      .magnitude
  }
  return FALLBACK_WINDOW_PERIOD
}
