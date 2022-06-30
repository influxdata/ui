import {
  CallExpression,
  Property,
  StringLiteral,
  Identifier,
  VariableAssignment,
} from 'src/types'
import {
  WINDOW_PERIOD,
  TIME_RANGE_START,
  TIME_RANGE_STOP,
} from 'src/variables/constants'
import {AstScope, rangeTimes, propertyTime} from 'src/shared/utils/ast'
import {convertMillisecondDurationToWindowPeriod} from 'src/shared/utils/windowPeriod'

/**
 * @param scope -- Scope at point in AST walk
 * @param startAst -- AST subtree for the startTime property
 * @param stopAst -- AST subtree for the stopTime property
 * @returns {VariableAssignment} -- AST node for the windowPeriod
 */
export function constructWindowVarAssignmentFromTimes(
  scope: AstScope,
  startAst: Property,
  stopAst: Property = null
): VariableAssignment {
  const NOW = Date.now()

  const extractFromPropertySubtree = (n: Property, k: string) => {
    if ((n.key as Identifier)?.name === k) {
      return propertyTime(scope, n.value, NOW)
    } else if ((n.key as StringLiteral)?.value === k) {
      return propertyTime(scope, n.key as StringLiteral, NOW)
    }
  }

  const start = extractFromPropertySubtree(startAst, TIME_RANGE_START)
  let end = NOW
  if (stopAst) {
    end = extractFromPropertySubtree(stopAst, TIME_RANGE_STOP)
  }

  const duration = convertMillisecondDurationToWindowPeriod(end - start)

  return {
    type: 'VariableAssignment',
    id: {
      type: 'Identifier',
      name: WINDOW_PERIOD,
    },
    init: {
      type: 'DurationLiteral',
      values: [{magnitude: duration, unit: 'ms'}],
    },
  }
}

/**
 * @param scope -- Scope at point in AST walk
 * @param range -- AST subtree for the range
 * @returns {VariableAssignment} -- AST node for the windowPeriod
 */
export function constructWindowVarAssignmentFromRange(
  scope: AstScope,
  range: CallExpression
): VariableAssignment {
  const [start, end] = rangeTimes(scope, range)
  return {
    type: 'VariableAssignment',
    id: {
      type: 'Identifier',
      name: WINDOW_PERIOD,
    },
    init: {
      type: 'DurationLiteral',
      values: [
        {
          magnitude: convertMillisecondDurationToWindowPeriod(end - start),
          unit: 'ms',
        },
      ],
    },
  }
}
