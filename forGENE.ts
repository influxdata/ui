import {parse, format_from_js_file} from '@influxdata/flux'
import {FromFluxResult, FluxDataType, Table} from '@influxdata/giraffe'

interface QueryFn {
  name: string
  flux: (period?: string, fillValues?: boolean) => string
}

interface QueryScope {
  [props: string]: any
}

interface Stage {
  id: string
  scope: QueryScope
  source?: string
  visual?: string
}

type PipeData = any

interface PipeMeta {
  title: string
  height?: number
  visible: boolean
  error?: string
}

interface DataLookup<T> {
  [key: string]: T
}

interface Resource<T> {
  byID: DataLookup<T>
  allIDs: string[]
}

enum AutoRefreshStatus {
  Active = 'active',
  Disabled = 'disabled',
  Paused = 'paused',
}

type TimeRange =
  | SelectableDurationTimeRange
  | DurationTimeRange
  | CustomTimeRange

type SelectableTimeRangeLower =
  | 'now() - 1m'
  | 'now() - 5m'
  | 'now() - 15m'
  | 'now() - 1h'
  | 'now() - 3h'
  | 'now() - 6h'
  | 'now() - 12h'
  | 'now() - 24h'
  | 'now() - 2d'
  | 'now() - 7d'
  | 'now() - 30d'

interface SelectableDurationTimeRange {
  lower: SelectableTimeRangeLower
  upper: Nullable<string>
  seconds: number
  format?: string
  label: string
  duration: string
  type: 'selectable-duration'
  windowPeriod: number
}

interface DurationTimeRange {
  lower: string
  upper: Nullable<string>
  type: 'duration'
}

interface CustomTimeRange {
  lower: string
  upper: string
  type: 'custom'
}

interface AutoRefresh {
  status: AutoRefreshStatus
  interval: number
  duration?: CustomTimeRange | null
  inactivityTimeout?: number | null
  infiniteDuration: boolean
  label?: string
}

type Column =
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


interface InternalFromFluxResult extends FromFluxResult {
  table: InternalTable
}

interface FluxResult {
  source: string // the query that was used to generate the flux
  parsed: InternalFromFluxResult // the parsed result
  error?: string // any error that might have happend while fetching
}


interface Flow {
  name: string
  range: TimeRange
  refresh: AutoRefresh
  data: Resource<PipeData>
  meta: Resource<PipeMeta>
  results: FluxResult
  readOnly?: boolean
  createdAt?: Date
  updatedAt?: Date
}

const genFlux = (
  func: string,
  period: string,
  fillValues: boolean = false
) => {
  if (period === 'none') {
    return `|> ${func}()`
  }

  switch (func) {
    case 'derivative': {
      return `|> derivative(unit: 1s, nonNegative: false)`
    }

    case 'nonnegative derivative': {
      return `|> derivative(unit: 1s, nonNegative: true)`
    }

    case 'median':
      case 'mean':
      case 'max':
      case 'min':
      case 'sum':
      case 'stddev':
      case 'first':
      case 'last': {
      return `|> aggregateWindow(every: ${period}, fn: ${func}, createEmpty: ${fillValues})`
    }

    default:
      return `|> ${func}()`
  }
}

const FUNCTIONS: QueryFn[] = [
  {
    name: 'mean',
    flux: (period, fillValues) => genFlux('mean', period, fillValues),
  },
  {
    name: 'median',
    flux: (period, fillValues) => genFlux('median', period, fillValues),
  },
  {
    name: 'max',
    flux: (period, fillValues) => genFlux('max', period, fillValues),
  },
  {
    name: 'min',
    flux: (period, fillValues) => genFlux('min', period, fillValues),
  },
  {
    name: 'sum',
    flux: (period, fillValues) => genFlux('sum', period, fillValues),
  },
  {
    name: 'derivative',
    flux: (period, fillValues) => genFlux('derivative', period, fillValues),
  },
  {
    name: 'nonnegative derivative',
    flux: (period, fillValues) =>
      genFlux('nonnegative derivative', period, fillValues),
  },
  {
    name: 'distinct',
    flux: (period, fillValues) => genFlux('distinct', period, fillValues),
  },
  {
    name: 'count',
    flux: (period, fillValues) => genFlux('count', period, fillValues),
  },
  {
    name: 'increase',
    flux: (period, fillValues) => genFlux('increase', period, fillValues),
  },
  {
    name: 'skew',
    flux: (period, fillValues) => genFlux('skew', period, fillValues),
  },
  {
    name: 'spread',
    flux: (period, fillValues) => genFlux('spread', period, fillValues),
  },
  {
    name: 'stddev',
    flux: (period, fillValues) => genFlux('stddev', period, fillValues),
  },
  {
    name: 'first',
    flux: (period, fillValues) => genFlux('first', period, fillValues),
  },
  {
    name: 'last',
    flux: (period, fillValues) => genFlux('last', period, fillValues),
  },
  {
    name: 'unique',
    flux: (period, fillValues) => genFlux('unique', period, fillValues),
  },
  {
    name: 'sort',
    flux: (period, fillValues) => genFlux('sort', period, fillValues),
  },
]

const find = (node: File, test, acc = []) => {
  if (!node) {
    return acc
  }

  if (test(node)) {
    acc.push(node)
  }

  Object.values(node).forEach(val => {
    if (Array.isArray(val)) {
      val.forEach(_val => {
        find(_val, test, acc)
      })
    } else if (typeof val === 'object') {
      find(val, test, acc)
    }
  })

  return acc
}

const PIPE_DEFINITONS = {
  'columnEditor': {
    visual: (_data, query) => {
      return `${query} |> limit(n: 100)`
    },
    source: (data, query) => {
      if (!Object.values(data.mappings).length) {
        return query
      }

      const mods = Object.entries(data.mappings as Hash<Mapping>).reduce(
        (acc, [k, v]) => {
          if (!v.visible) {
            acc.dropped.push(`"${k}"`)
            return acc
          }

          acc.renamed.push(`"${k}": "${v.name}"`)
          return acc
        },
        {
          renamed: [],
          dropped: [],
        }
      )

      if (mods.renamed.length) {
        query += `\n |> rename(columns: {${mods.renamed.join(', ')}})`
      }

      if (mods.dropped.length) {
        query += `\n |> drop(columns: [${mods.dropped.join(', ')}])`
      }

      return query
    },
  },
  'downsample': {
    source: (data, query) => {
      if (!data.aggregateWindow.period || !data.functions.length) {
        return query
      }

      return (
        query +
          data.functions
        .map(fn => {
          const spec = fn && FUNCTIONS.find(f => f.name === fn.name)

          if (!spec) {
            return ''
          }

          const period = data.aggregateWindow.period
          return spec.flux(
            period === 'auto' || !period ? 'v.windowPeriod' : period,
            data.aggregateWindow.fillValues
          )
        })
        .join('')
      )
    },
  },
  'markdown': {},
  'metricSelector': {
    source: data => {
      const {bucket, field, measurement, tags} = data

      if (!bucket) {
        return ''
      }

      if (!(field || measurement || Object.values(tags).length)) {
        return ''
      }

      let text = `from(bucket: "${bucket.name}") |> range(start: v.timeRangeStart, stop: v.timeRangeStop)`
      if (measurement) {
        text += ` |> filter(fn: (r) => r["_measurement"] == "${measurement}")`
      }
      if (field) {
        text += ` |> filter(fn: (r) => r["_field"] == "${field}")`
      }
      if (tags && Object.keys(tags)?.length > 0) {
        Object.keys(tags)
        .filter((tagName: string) => !!tags[tagName])
        .forEach((tagName: string) => {
          const tagValues = tags[tagName]
          if (tagValues.length === 1) {
            text += ` |> filter(fn: (r) => r["${tagName}"] == "${tagValues[0]}")`
          } else {
            tagValues.forEach((val, i) => {
              if (i === 0) {
                text += ` |> filter(fn: (r) => r["${tagName}"] == "${val}"`
              }
              if (tagValues.length - 1 === i) {
                text += ` or r["${tagName}"] == "${val}")`
              } else {
                text += ` or r["${tagName}"] == "${val}"`
              }
            })
          }
        })
      }

      return text
    },
  },
  'notification': {
    visual: (_data, query) => {
      return query
    },
  },
  'queryBuilder': {
    source: data => {
      if (
        !data.buckets[0] ||
        !data.tags.reduce((acc, curr) => acc.concat(curr.values), []).length
      ) {
        return ''
      }

      const tags = data.tags
        .map(tag => {
          if (!tag.key) {
            return ''
          }

          if (tag.aggregateFunctionType === 'filter') {
            if (!tag.values.length) {
              return ''
            }

            const vals = tag.values
              .map(
                value => `r["${tag.key}"] == "${value.replace(/\\/g, '\\\\')}"`
              )
              .join(' or ')

            return `\n  |> filter(fn: (r) => ${vals})`
          }

          if (tag.aggregateFunctionType === 'group') {
            const quotedValues = tag.values.map(value => `"${value}"`) // wrap the value in double quotes

            if (quotedValues.length) {
              return `\n  |> group(columns: [${quotedValues.join(', ')}])` // join with a comma (e.g. "foo","bar","baz")
            }

            return '\n  |> group()'
          }

          return ''
        })
        .join('')

      return `from(bucket: "${data.buckets[0]}") |> range(start: v.timeRangeStart, stop: v.timeRangeStop)${tags}`
    },
  },
  'rawFluxEditor': {
    source: (data, query) => {
      try {
        const ast = parse(
          data.queries[data.activeQuery].text.replace(PREVIOUS_REGEXP, query)
        )
        find(ast, node => !!Object.keys(node.comments || {}).length).forEach(
          node => {
            delete node.comments
          }
        )
        return format_from_js_file(ast)
      } catch {
        return
      }
    },
  },
  'region': {
    scope: (data, prev) => {
      return {
        ...prev,
        region: data.region,
        token: data.token,
        org: data.org,
      }
    },
  },
  'remoteCSV': {
    source: data => {
      if (!data.url?.length) {
        return ''
      }
      return data.sampleName === 'Custom'
        ? `import "experimental/csv"
      csv.from(url: "${data.url}")`
        : `import "influxdata/influxdb/sample"
      sample.data(
        set: "${data.sampleName}"
      )`
    },
  },
  'schedule': {},
  'spotify': {},
  'toBucket': {
    source: (data, query, scope) => {
      if (!scope.withSideEffects || !data?.bucket) {
        return query
      }

      return `${query} |> to(bucket: "${data.bucket?.name.trim()}")`
    },
  },
  'visualization': {
    visual: (data, query) => {
      if (data.properties.type === 'simple-table') {
        return `${query} |> limit(n: 100)`
      }

      if (
        data.properties.type === 'single-stat' ||
        data.properties.type === 'gauge'
      ) {
        return `${query} |> last()`
      }

      if (!data.functions || !data.functions.length || !data.period) {
        return query
      }

      const _build = (config, fn?) => {
        if (config.functions) {
          return config.functions
            .map(fnc => {
              const conf = {...config}
              delete conf.functions
              return _build(conf, fnc)
            })
            .filter(q => q.length)
            .join('\n\n')
        }

        const fnSpec = fn && FUNCTIONS.find(spec => spec.name === fn.name)

        if (!fnSpec) {
          return ''
        }

        const flux = fnSpec.flux(data.period, false)

        return `${query} ${flux} |> yield(name: "${fn.name}")`
      }

      return _build(data)
    },
  },
  'youtube': {},
}

const generateMap = (flow): Stage[] => {
  return flow.data.allIDs.reduce((acc, panelID) => {
    const panel = flow.data.get(panelID)

    const last = acc[acc.length - 1] || {
      scope: {
        withSideEffects: false,
        region: /****    get this from the share info    *****/,
        org: /****    get this from the share info    *****/,
      },
      source: '',
      visual: '',
    }

    const meta = {
      ...last,
      id: panel.id,
      visual: '',
    }

    if (!PIPE_DEFINITIONS[panel.type]) {
      acc.push(meta)
      return acc
    }

    if (typeof PIPE_DEFINITIONS[panel.type].scope === 'function') {
      meta.scope = PIPE_DEFINITIONS[panel.type].scope(
        panel,
        acc[acc.length - 1]?.scope || {}
      )
    }

    if (typeof PIPE_DEFINITIONS[panel.type].source === 'function') {
      meta.source = PIPE_DEFINITIONS[panel.type].source(
        panel,
        '' + (acc[acc.length - 1]?.source || ''),
        meta.scope
      )
    }

    if (typeof PIPE_DEFINITIONS[panel.type].visual === 'function') {
      meta.visual = PIPE_DEFINITIONS[panel.type].visual(
        panel,
        '' + (acc[acc.length - 1]?.source || ''),
        meta.scope
      )
    }

    acc.push(meta)
    return acc
  }, [])
}
