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
import {convertTimeRangeDurationToWindowPeriodDuration} from 'src/shared/utils/duration'

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

  const duration = convertTimeRangeDurationToWindowPeriodDuration(end - start)

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

export function constructWindowVarAssignmentFromRange(
  scope,
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
          magnitude: convertTimeRangeDurationToWindowPeriodDuration(
            end - start
          ),
          unit: 'ms',
        },
      ],
    },
  }
}
