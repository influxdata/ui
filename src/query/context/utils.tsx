import {
  Variable,
  OptionStatement,
  VariableAssignment,
  ObjectExpression,
  File,
} from 'src/types'

// Utils
import {find} from 'src/flows/context/query'

// Types
import {
  TIME_RANGE_START,
  TIME_RANGE_STOP,
  WINDOW_PERIOD,
} from 'src/variables/constants'
import {FromFluxResult, FluxDataType, Table} from '@influxdata/giraffe'
import {parse, format_from_js_file} from '@influxdata/flux'
import {propertyTime} from 'src/shared/utils/getMinDurationFromAST'
import {SELECTABLE_TIME_RANGES} from 'src/shared/constants/timeRanges'

export type Column =
  | {
      name: string
      type: 'number'
      fluxDataType: FluxDataType
      data: Array<number | null>
    } //  parses empty numeric values as null
  | {name: string; type: 'time'; fluxDataType: FluxDataType; data: number[]}
  | {name: string; type: 'boolean'; fluxDataType: FluxDataType; data: boolean[]}
  | {name: string; type: 'string'; fluxDataType: FluxDataType; data: string[]}

interface Columns {
  [columnKey: string]: Column
}

// This isn't actually optional, it just makes the type system work
interface InternalTable extends Table {
  columns?: Columns
}

export interface InternalFromFluxResult extends FromFluxResult {
  table: InternalTable
}
interface VariableMap {
  [key: string]: Variable
}

export interface FluxResult {
  source: string // the query that was used to generate the flux
  parsed: InternalFromFluxResult // the parsed result
  error?: string // any error that might have happend while fetching
}

export const _getGlobalDefinedVars = (usedVars: VariableMap) => {
  return Object.values(usedVars).reduce((acc, v) => {
    let _val

    if (!v) {
      return acc
    }

    if (v.id === WINDOW_PERIOD) {
      acc[v.id] = (v.arguments?.values || [10000])[0] + 'ms'

      return acc
    }

    if (v.id === TIME_RANGE_START || v.id === TIME_RANGE_STOP) {
      const val = v.arguments.values[0]

      if (!isNaN(Date.parse(val))) {
        acc[v.id] = new Date(val).toISOString()
        return acc
      }

      if (typeof val === 'string') {
        if (val) {
          acc[v.id] = val
        }

        return acc
      }

      _val = '-' + val[0].magnitude + val[0].unit

      if (_val !== '-') {
        acc[v.id] = _val
      }

      return acc
    }

    if (v.arguments.type === 'map') {
      _val =
        v.arguments.values[
          v.selected ? v.selected[0] : Object.keys(v.arguments.values)[0]
        ]

      if (_val) {
        acc[v.id] = _val
      }

      return acc
    }

    if (v.arguments.type === 'constant') {
      _val = v.selected ? v.selected[0] : v.arguments.values[0]

      if (_val) {
        acc[v.id] = _val
      }

      return acc
    }

    if (v.arguments.type === 'query') {
      if (!v.selected || !v.selected[0]) {
        return
      }

      acc[v.id] = v.selected[0]
      return acc
    }

    return acc
  }, {})
}

export const _getQueryDefinedVars = (ast: File) => {
  return remove(
    ast,
    node => node.type === 'OptionStatement' && node.assignment.id.name === 'v'
  ).reduce((acc, curr) => {
    // eslint-disable-next-line no-extra-semi
    ;(curr.assignment?.init?.properties || []).reduce((_acc, _curr) => {
      if (_curr.key?.name && _curr.value?.location?.source) {
        _acc[_curr.key.name] = _curr.value.location.source
      }

      return _acc
    }, acc)

    return acc
  }, {})
}

export const _getJoinedVars = (
  usedVars: VariableMap,
  globalDefinedVars,
  queryDefinedVars
) => {
  // Merge the two variable maps, allowing for any user defined variables to override
  // global system variables
  return Object.keys(usedVars).reduce((acc, curr) => {
    if (globalDefinedVars.hasOwnProperty(curr)) {
      acc[curr] = globalDefinedVars[curr]
    }

    if (queryDefinedVars.hasOwnProperty(curr)) {
      acc[curr] = queryDefinedVars[curr]
    }

    return acc
  }, {})
}

export const _getTaskParams = (ast: File) => {
  // Join together any duplicate task options
  return remove(
    ast,
    node =>
      node.type === 'OptionStatement' && node.assignment.id.name === 'task'
  )
    .reverse()
    .reduce((acc, curr) => {
      // eslint-disable-next-line no-extra-semi
      ;(curr.assignment?.init?.properties || []).reduce((_acc, _curr) => {
        if (_curr.key?.name && _curr.value?.location?.source) {
          _acc[_curr.key.name] = _curr.value.location.source
        }

        return _acc
      }, acc)

      return acc
    }, {})
}

export const _getVarVals = (usedVars: VariableMap, ast: File) => {
  // Grab all global variables and turn them into a hashmap
  // TODO: move off this variable junk and just use strings
  const globalDefinedVars = _getGlobalDefinedVars(usedVars)

  // Grab all variables that are defined in the query while removing the old definition from the AST
  const queryDefinedVars = _getQueryDefinedVars(ast)

  // Merge the two variable maps, allowing for any user defined variables to override
  // global system variables
  const joinedVars = _getJoinedVars(
    usedVars,
    globalDefinedVars,
    queryDefinedVars
  )

  return Object.entries(joinedVars)
    .map(([k, v]) => `${k}: ${v}`)
    .join(',\n')
}

export const _getVars = (
  ast,
  allVars: VariableMap = {},
  acc: VariableMap = {}
): VariableMap =>
  find(
    ast,
    node => node?.type === 'MemberExpression' && node?.object?.name === 'v'
  )
    .map(node => node.property.name)
    .reduce((tot, curr) => {
      if (tot.hasOwnProperty(curr)) {
        return tot
      }

      if (!allVars[curr]) {
        tot[curr] = null
        return tot
      }
      tot[curr] = allVars[curr]

      if (tot[curr].arguments.type === 'query') {
        _getVars(parse(tot[curr].arguments.values.query), allVars, tot)
      }

      return tot
    }, acc)

// Removes all instances of nodes that match with the test function
// and returns the nodes that were returned as an array
export const remove = (node: File, test, acc = []) => {
  if (!node) {
    return acc
  }

  Object.entries(node).forEach(([key, val]) => {
    if (Array.isArray(val)) {
      let ni = 0
      while (ni < val.length) {
        if (test(val[ni])) {
          acc.push(val[ni])
          val.splice(ni, 1)
          continue
        }
        remove(val[ni], test, acc)
        ni++
      }
    } else if (typeof val === 'object') {
      if (val && test(val)) {
        delete node[key]
      } else {
        remove(val, test, acc)
      }
    }
  })

  return acc
}

const DESIRED_POINTS_PER_GRAPH = 360
const FALLBACK_WINDOW_PERIOD = 15000

export const _addWindowPeriod = (ast, optionAST): void => {
  const queryRanges = find(
    ast,
    node =>
      node?.callee?.type === 'Identifier' && node?.callee?.name === 'range'
  ).map(node =>
    (node.arguments[0]?.properties || []).reduce(
      (acc, curr) => {
        if (curr.key.name === 'start') {
          acc.start = propertyTime(ast, curr.value, Date.now())
        }

        if (curr.key.name === 'stop') {
          acc.stop = propertyTime(ast, curr.value, Date.now())
        }

        return acc
      },
      {
        start: '',
        stop: Date.now(),
      }
    )
  )

  if (!queryRanges.length) {
    const variableAssignment = (optionAST.body[0] as OptionStatement)
      .assignment as VariableAssignment
    ;(variableAssignment.init as ObjectExpression).properties.push({
      type: 'Property',
      key: {
        type: 'Identifier',
        name: 'windowPeriod',
      },
      value: {
        type: 'DurationLiteral',
        values: [{magnitude: FALLBACK_WINDOW_PERIOD, unit: 'ms'}],
      },
    })

    return
  }
  const starts = queryRanges.map(t => t.start)
  const stops = queryRanges.map(t => t.stop)
  const cartesianProduct = starts.map(start => stops.map(stop => [start, stop]))

  const durations = []
    .concat(...cartesianProduct)
    .map(([start, stop]) => stop - start)
    .filter(d => d > 0)

  const queryDuration = Math.min(...durations)
  const foundDuration = SELECTABLE_TIME_RANGES.find(
    tr => tr.seconds * 1000 === queryDuration
  )

  if (foundDuration) {
    ;(((optionAST.body[0] as OptionStatement).assignment as VariableAssignment) // eslint-disable-line no-extra-semi
      .init as ObjectExpression).properties.push({
      type: 'Property',
      key: {
        type: 'Identifier',
        name: 'windowPeriod',
      },
      value: {
        type: 'DurationLiteral',
        values: [{magnitude: foundDuration.windowPeriod, unit: 'ms'}],
      },
    })

    return
  }
  ;(((optionAST.body[0] as OptionStatement).assignment as VariableAssignment) // eslint-disable-line no-extra-semi
    .init as ObjectExpression).properties.push({
    type: 'Property',
    key: {
      type: 'Identifier',
      name: 'windowPeriod',
    },
    value: {
      type: 'DurationLiteral',
      values: [
        {
          magnitude: Math.round(queryDuration / DESIRED_POINTS_PER_GRAPH),
          unit: 'ms',
        },
      ],
    },
  })
}

export const simplify = (text, vars: VariableMap = {}) => {
  const ast = parse(text)
  const usedVars = _getVars(ast, vars)

  const varVals = _getVarVals(usedVars, ast)
  const optionAST = parse(`option v = {\n${varVals}\n}\n`)

  if (varVals.length) {
    ast.body.unshift(optionAST.body[0])
  }

  // Join together any duplicate task options
  const taskParams = _getTaskParams(ast)

  if (Object.keys(taskParams).length) {
    const taskVals = Object.entries(taskParams)
      .map(([k, v]) => `${k}: ${v}`)
      .join(',\n')
    const taskAST = parse(`option task = {\n${taskVals}\n}\n`)
    ast.body.unshift(taskAST.body[0])
  }

  // load in windowPeriod at the last second, because it needs to self reference all the things
  if (usedVars.hasOwnProperty('windowPeriod')) {
    _addWindowPeriod(ast, optionAST)
  }

  // turn it back into a query
  return format_from_js_file(ast)
}
