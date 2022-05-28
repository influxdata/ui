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
    * always return a windowPeriod ast node:
        * flag if node was created (and must be injected)
    * use cases:
        * construction of optionASTs
        * in query construction (for backend)
        * for sending to LSP
*/
export function getWindowPeriodVariableAssignment(
  ast: Node,
  outerContext: Node
): {toInject: boolean; node: VariableAssignment} {
  const whenFound = (_, acc) => {
    if (
      !acc.scope[`v.${WINDOW_PERIOD}`] &&
      acc.scope[`v.${TIME_RANGE_START}`]
    ) {
      acc.scope[`v.${WINDOW_PERIOD}`] = constructWindowVarAssignmentFromTimes(
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

/*
  Determining a set duration value for `v.windowPeriod`:
    * when a number must be returned
    * use cases:
        * the outer UI window display (scope outside editor)
        * NOT for lsp, query to backend, etc
    * tech debt:
        * currently, notebooks code is seeking & overwriting `option v` in flux
        * therefore, this method is used for that code. Although this is not ideal. 

  Note this is a windowPeriod duration. Not a timeRange duration.
*/
export function getDurationFromAST(ast: Node, outerContext: Node): number {
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
