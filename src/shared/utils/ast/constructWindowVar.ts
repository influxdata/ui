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
import {rangeTimes, propertyTime} from 'src/shared/utils/ast/extractors'

export function constructWindowVarAssignmentFromTimes(
  startAst: Property,
  stopAst: Property = null
): VariableAssignment {
  const NOW = Date.now()

  const extractFromPropertySubtree = (n: Property, k: string) => {
    if ((n.key as Identifier)?.name === k) {
      return propertyTime(n, n.value, NOW)
    } else if ((n.key as StringLiteral)?.value === k) {
      return propertyTime(n, n.key as StringLiteral, NOW)
    }
  }

  const start = extractFromPropertySubtree(startAst, TIME_RANGE_START)
  let end = NOW
  if (stopAst) {
    end = extractFromPropertySubtree(stopAst, TIME_RANGE_STOP)
  }

  return {
    type: 'VariableAssignment',
    id: {
      type: 'Identifier',
      name: WINDOW_PERIOD,
    },
    init: {
      type: 'DurationLiteral',
      values: [{magnitude: end - start, unit: 'ms'}],
    },
  }
}

export function constructWindowVarAssignmentFromRange(
  ast: Node,
  range: CallExpression
): VariableAssignment {
  const [start, end] = rangeTimes(ast, range)
  return {
    type: 'VariableAssignment',
    id: {
      type: 'Identifier',
      name: WINDOW_PERIOD,
    },
    init: {
      type: 'DurationLiteral',
      values: [{magnitude: end - start, unit: 'ms'}],
    },
  }
}
