import {FluxFunction} from 'src/types/shared'

// temporary solution, for the top 20 functions
// longterm solution requires changes in the payload from the backend (flux docs)
const TOP_20 = {
  'universe.filter': 'filter(fn: (r) => r._measurement == "cpu")',
  'universe.range': 'range(start: -15m, stop: now())',
  'universe.sort': 'sort(columns: ["_value"], desc: false)',
  'universe.keep': 'keep(columns: ["col1", "col2"])',
  'universe.yield': 'yield(name: "custom-name")',
  'universe.map': 'map(fn: (r) => ({ r with _value: r._value * r._value }))',
  'universe.pivot':
    'pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")',
  'universe.last': 'last()',
  'universe.fill': 'fill(column: "_value", usePrevious: true)',
  'universe.time': 'time(v: r._value)',
  'universe.union': 'union(tables: [table1, table2])',
  'universe.int': 'int(v: r._value)',
  'events.duration': `events.duration(
    unit: 1ns,
    columnName: "duration",
    timeColumn: "_time",
    stopColumn: "_stop",
    stop: 2020-01-01T00:00:00Z
)`,
  'universe.group': 'group(columns: ["host", "_measurement"], mode:"by")',
  'universe.aggregateWindow':
    'aggregateWindow(every: v.windowPeriod, fn: mean)',
  'universe.limit': 'limit(n:10, offset: 0)',
  'universe.now': 'now()',
  'universe.distinct': 'distinct(column: "host")',
  'universe.sum': 'sum(column: "_value")',
}

export const getFluxExample = (func: FluxFunction) => {
  const {fluxParameters = [], kind, name, package: packageName} = func

  let example = `${packageName}.${name}`

  if (!!TOP_20[example]) {
    return {...func, example: TOP_20[example]}
  }

  if (kind.toLowerCase() === 'function') {
    let injectedParameters = ''
    for (const parameter of fluxParameters) {
      if (parameter.required) {
        // add a comma if the current injected list is not all spaces
        if (injectedParameters.trim().length !== 0) {
          injectedParameters = `${injectedParameters}, `
        }
        injectedParameters = `${injectedParameters}${parameter.name}: `
      } else {
        injectedParameters = `${injectedParameters} `
      }
    }
    example =
      packageName === 'universe'
        ? `${name}(${injectedParameters.trim()})`
        : `${packageName}.${name}(${injectedParameters.trim()})`
  }
  return {...func, example}
}
