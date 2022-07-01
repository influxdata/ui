import {CallExpression, Expression, VariableAssignment} from 'src/types'
import {WINDOW_PERIOD} from 'src/variables/constants'
import {
  AstScope,
  rangeTimes,
  propertyTime,
  ScopeVariableAssignedNodeT,
  lookupVariable,
} from 'src/shared/utils/ast'
import {convertMillisecondDurationToWindowPeriod} from 'src/shared/utils/windowPeriod'
import {FALLBACK_WINDOW_PERIOD} from 'src/shared/constants/timeRanges'

const makeNode = (duration: number | string): VariableAssignment => ({
  type: 'VariableAssignment',
  id: {
    type: 'Identifier',
    name: WINDOW_PERIOD,
  },
  init: {
    type: 'DurationLiteral',
    values: [{magnitude: Number(duration), unit: 'ms'}],
  },
})

/**
 * @param scope -- Scope at point in AST walk
 * @param range -- AST subtree for the range `|> range()`
 * @returns {VariableAssignment} -- AST node for the windowPeriod
 */
export function constructWindowVarAssignmentFromRange(
  scope: AstScope,
  range: CallExpression
): VariableAssignment {
  const [start, end] = rangeTimes(scope, range)
  return makeNode(convertMillisecondDurationToWindowPeriod(end - start))
}

/**
 * @param scope -- Scope at point in AST walk
 * @param startAst -- AST subtree for the startTime
 * @param stopAst -- AST subtree for the stopTime
 * @returns {VariableAssignment} -- AST node for the windowPeriod
 */
export function constructWindowVarAssignmentFromTimes(
  scope: AstScope,
  startAst: ScopeVariableAssignedNodeT,
  stopAst: ScopeVariableAssignedNodeT = null
): VariableAssignment {
  const NOW = Date.now()

  const start = propertyTime(scope, startAst, NOW)

  let end = NOW
  if (stopAst) {
    end = propertyTime(scope, stopAst, NOW)
  }

  const duration = convertMillisecondDurationToWindowPeriod(end - start)
  return makeNode(duration)
}

/**
 * @param expr -- expression assigned to windowPeriod
 * @returns {VariableAssignment} -- AST node for the windowPeriod
 */
export function constructWindowVarAssignmentFromExpression(
  expr: Expression,
  scope: AstScope
): VariableAssignment {
  switch (expr.type) {
    case 'Identifier':
      try {
        const aliasedNode = lookupVariable(scope, expr.name)
        return constructWindowVarAssignmentFromExpression(aliasedNode, scope)
      } catch (e) {
        console.warn(e)
        return makeNode(FALLBACK_WINDOW_PERIOD)
      }
    case 'IntegerLiteral':
    case 'UnsignedIntegerLiteral':
      return makeNode(expr.value)
    case 'DurationLiteral':
      return {
        type: 'VariableAssignment',
        id: {
          type: 'Identifier',
          name: WINDOW_PERIOD,
        },
        init: expr,
      }
    default:
      console.warn('Cannot convert AST node to VariableAssignment.')
      return makeNode(FALLBACK_WINDOW_PERIOD)
  }
}
