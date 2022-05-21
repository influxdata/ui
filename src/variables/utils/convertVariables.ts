// Const
import {
  TIME_RANGE_START,
  TIME_RANGE_STOP,
  WINDOW_PERIOD,
} from 'src/variables/constants'

// Types
import {VariableAssignment} from 'src/types/ast'
import {Variable} from 'src/types'

export const asAssignmentNode = (variable: Variable): VariableAssignment => {
  const out = {
    type: 'VariableAssignment' as const,
    id: {
      type: 'Identifier' as const,
      name: variable.name,
    },
  } as VariableAssignment

  if (variable.id === WINDOW_PERIOD) {
    out.init = {
      type: 'DurationLiteral',
      values: [{magnitude: variable.arguments.values[0] || 10000, unit: 'ms'}],
    }

    return out
  }

  if (variable.id === TIME_RANGE_START || variable.id === TIME_RANGE_STOP) {
    const val = variable.arguments.values[0]

    if (!isNaN(Date.parse(val))) {
      out.init = {
        type: 'DateTimeLiteral',
        value: new Date(val).toISOString(),
      }
    } else if (val === 'now()') {
      out.init = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'now',
        },
      }
    } else if (val) {
      out.init = {
        type: 'UnaryExpression',
        operator: '-',
        argument: {
          type: 'DurationLiteral',
          values: val,
        },
      }
    }

    return out
  }

  if (variable.arguments.type === 'map') {
    if (!variable.selected) {
      variable.selected = [Object.keys(variable.arguments.values)[0]]
    }
    out.init = {
      type: 'StringLiteral',
      value: variable.arguments.values[variable.selected[0]],
    }
  }

  if (variable.arguments.type === 'constant') {
    if (!variable.selected) {
      variable.selected = [variable.arguments.values[0]]
    }
    out.init = {
      type: 'StringLiteral',
      value: variable.selected[0],
    }
  }

  if (variable.arguments.type === 'query') {
    if (!variable.selected || !variable.selected[0]) {
      out.init = {
        type: 'StringLiteral',
        value: '',
      }
    } else {
      out.init = {
        type: 'StringLiteral',
        value: variable.selected[0],
      }
    }
  }

  return out
}
