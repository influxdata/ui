// Libraries
import React, {FC, createContext, useState, ReactChild} from 'react'
import {fromFlux} from '@influxdata/giraffe'
import {v4 as UUID} from 'uuid'

import {
  runQuery,
  RunQueryResult,
  RunQuerySuccessResult,
} from 'src/shared/apis/query'
import {
  AppState,
  RemoteDataState,
  Variable,
  OptionStatement,
  VariableAssignment,
  ObjectExpression,
  CancellationError,
  TimePeriod,
  File,
} from 'src/types'

// Utils
import {find} from 'src/flows/context/query'

// Types
import {ASTIM, parseASTIM} from 'src/variables/utils/astim'

import {getOrg} from 'src/organizations/selectors'
import {connect, ConnectedProps, useSelector} from 'react-redux'
import {buildUsedVarsOption} from 'src/variables/utils/buildVarsOption'
import {getTimeRangeWithTimezone} from 'src/dashboards/selectors'
import {getVariables} from 'src/variables/selectors'
import {getRangeVariable} from 'src/variables/utils/getTimeRangeVars'
import {
  TIME_RANGE_START,
  TIME_RANGE_STOP,
  WINDOW_PERIOD,
} from 'src/variables/constants'
import {hashCode} from 'src/shared/apis/queryCache'
import {getWindowVarsFromVariables} from 'src/variables/utils/getWindowVars'
import {reject} from 'lodash'
import {FromFluxResult, FluxDataType, Table} from '@influxdata/giraffe'
import {
  RATE_LIMIT_ERROR_STATUS,
  RATE_LIMIT_ERROR_TEXT,
} from 'src/cloud/constants'
import {parse, format_from_js_file} from '@influxdata/flux'
import {propertyTime} from 'src/shared/utils/getMinDurationFromAST'
import {SELECTABLE_TIME_RANGES} from 'src/shared/constants/timeRanges'
import {getSortedBuckets} from 'src/buckets/selectors'
import {API_BASE_PATH} from 'src/shared/constants'

type Tags = Set<string> | null

interface QueryResult {
  flux: FluxResult
  timeRange: TimePeriod
}

const DEFAULT_TTL = 30
const TEN_MINUTES = 60 * 1000 * 10

interface QuerySignature {
  destroy: () => void
  bucket: string
  query: string
}

class Query implements QuerySignature {
  private astim: ASTIM
  private orgId: string
  private vars: Variable[]
  private abortController: AbortController
  private lastRun: number | null

  public id: string
  public status: RemoteDataState
  public tags: Tags
  public result: QueryResult
  public ttl

  constructor(
    orgId: string,
    vars: Variable[],
    query: string,
    ttl = DEFAULT_TTL,
    tags: Tags = null
  ) {
    this.reset()
    this.id = Query.hash(query)
    if (!tags) {
      tags = new Set<string>()
    }

    this.vars = vars
    this.ttl = ttl
    this.tags = tags
    this.query = query
    this.orgId = orgId
  }

  private reset(): void {
    this.lastRun = null
    this.tags = new Set<string>()
    this.status = RemoteDataState.NotStarted
    this.abortController = new AbortController()
    this.astim = null
    this.result = {
      flux: {
        source: '',
        parsed: null,
      },
      timeRange: {
        start: -1,
        end: -1,
      },
    }

    this.cancel()
  }

  private setResult(result: string): void {
    this.lastRun = Date.now()
    this.result = {
      flux: {
        source: result,
        parsed: null,
      },
      timeRange: {
        start: 1,
        end: 1,
      },
    }
  }

  private isExpired(): boolean {
    return !this.lastRun || Date.now() - this.lastRun >= this.ttl * 1000
  }

  static hash(query: string): string {
    return hashCode(query)
  }

  public destroy(): void {
    this.reset()

    this.lastRun = null
    this.status = null
    this.result = null
    this.abortController = null
  }

  // Setters / Getters
  set bucket(name: string | null) {
    const ast = this.astim.getAST()
    find(
      ast,
      node =>
        node?.type === 'CallExpression' &&
        node?.callee?.type === 'Identifier' &&
        node?.callee?.name === 'from' &&
        node.arguments[0]?.properties[0]?.key?.name === 'bucket'
    ).map(
      node =>
        (node.arguments[0].properties[0].value.location.source = `"${name}"`)
    )

    this.query = format_from_js_file(ast)
  }

  get bucket(): string {
    const ast = this.astim.getAST()
    const buckets = find(
      ast,
      node =>
        node?.type === 'CallExpression' &&
        node?.callee?.type === 'Identifier' &&
        node?.callee?.name === 'from' &&
        node.arguments[0]?.properties[0]?.key?.name === 'bucket'
    ).map(node => node.arguments[0]?.properties[0]?.value.value)

    if (buckets.length === 0) {
      return null
    }

    return buckets[0]
  }

  get query() {
    return format_from_js_file(this.astim.getAST())
  }

  set query(query: string) {
    const astim = parseASTIM(query)
    this.astim = astim
  }

  async run(tags: Tags = null): Promise<FluxResult> {
    return new Promise(resolve => {
      if (!this.hasTags(tags) || !this.isExpired()) {
        resolve(this.result.flux)
        return
      }

      this.cancel()
      this.status = RemoteDataState.Loading

      const windowVars = getWindowVarsFromVariables(this.query, this.vars)
      const extern = buildUsedVarsOption(this.query, this.vars, windowVars)

      runQuery(this.orgId, this.query, extern, this.abortController)
        .promise.then((r: RunQueryResult) => {
          if (r.type === 'UNKNOWN_ERROR') {
            reject('Issue with the query or AST')
            return
          }
          const csv = (r as RunQuerySuccessResult).csv
          this.setResult(csv)
          this.status = RemoteDataState.Done

          resolve(this.result.flux)
        })
        .catch(e => {
          reject(e)
        })
    })
  }

  cancel(tags: Tags = null) {
    if (!this.hasTags(tags)) {
      return
    } else if (this.status === RemoteDataState.Loading) {
      this.abortController.abort()
    }

    this.status = RemoteDataState.NotStarted
  }

  hasTags(tags: Tags = null): boolean {
    // If no tags supplied OR valid tags supplied
    return !tags || Array.from(tags).some(tag => this.tags.has(tag))
  }

  isWorthDeleting() {
    return this.lastRun && Date.now() - this.lastRun >= TEN_MINUTES
  }
}

interface OwnProps {
  children: ReactChild
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

interface CancelMap {
  [key: string]: () => void
}

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

const _getVars = (
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

const _addWindowPeriod = (ast, optionAST): void => {
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

  // Grab all global variables and turn them into a hashmap
  // TODO: move off this variable junk and just use strings
  const globalDefinedVars = Object.values(usedVars).reduce((acc, v) => {
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

  // Grab all variables that are defined in the query while removing the old definition from the AST
  const queryDefinedVars = remove(
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

  // Merge the two variable maps, allowing for any user defined variables to override
  // global system variables
  const joinedVars = Object.keys(usedVars).reduce((acc, curr) => {
    if (globalDefinedVars.hasOwnProperty(curr)) {
      acc[curr] = globalDefinedVars[curr]
    }

    if (queryDefinedVars.hasOwnProperty(curr)) {
      acc[curr] = queryDefinedVars[curr]
    }

    return acc
  }, {})

  const varVals = Object.entries(joinedVars)
    .map(([k, v]) => `${k}: ${v}`)
    .join(',\n')
  const optionAST = parse(`option v = {\n${varVals}\n}\n`)

  if (varVals.length) {
    ast.body.unshift(optionAST.body[0])
  }

  // Join together any duplicate task options
  const taskParams = remove(
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

export interface GlobalQueryContextType {
  query: (text: string, vars: VariableMap) => Promise<FluxResult>
  refreshQueries: () => void
  cancelQueries: (tags?: Tags) => void
  addQuery: (query: string, tags?: Tags, id?: string) => Query
  handleSubmit: (rawQuery: string) => Promise<FluxResult>
  isInitialized: boolean
  changeExpiration: (ttl: number) => void
}

export const DEFAULT_GLOBAL_QUERY_CONTEXT: GlobalQueryContextType = {
  refreshQueries: () => {},
  query: (_: string, __: VariableMap) => null,
  cancelQueries: (_: Tags) => {},
  addQuery: (_: string, __?: Tags, ___?: string) => null,
  handleSubmit: (_: string) => null,
  isInitialized: false,
  changeExpiration: (_: number) => {},
}

export const GlobalQueryContext = createContext<GlobalQueryContextType>(
  DEFAULT_GLOBAL_QUERY_CONTEXT
)

const GlobalQueryProvider: FC<Props> = ({children, variables}) => {
  const buckets = useSelector((state: AppState) => getSortedBuckets(state))
  const orgId = useSelector(getOrg).id
  const [queries, setQueries] = useState<Query[]>([])
  const [ttl, changeTTL] = useState(DEFAULT_TTL)
  const [pending, setPending] = useState({} as CancelMap)

  const changeExpiration = (seconds: number) => {
    queries.map(query => {
      query.ttl = seconds
    })

    changeTTL(seconds)
  }

  const refreshQueries = () => {
    setQueries(queries.filter(query => !query.isWorthDeleting()))
  }

  const findQuery = (query: string): Query => {
    const queryId = Query.hash(query)

    return queries.find(q => q.id === queryId)
  }

  const runQuery = async (
    rawQuery: string,
    tags?: Tags
  ): Promise<FluxResult> => {
    return addQuery(rawQuery, tags).run()
  }

  const addQuery = (rawQuery: string, tags: Tags = null): Query => {
    let query = findQuery(rawQuery)

    if (query) {
      return query
    }

    query = new Query(orgId, variables, rawQuery, ttl, tags)

    queries.push(query)

    setQueries(queries)

    return query
  }

  const handleSubmit = async (rawQuery): Promise<FluxResult> => {
    return runQuery(rawQuery)
  }

  const cancelQueries = async (tags: Tags = null) => {
    await Promise.all(queries.map(query => query.cancel(tags)))

    setQueries(queries)
  }

  const _getOrg = ast => {
    const queryBuckets = find(
      ast,
      node =>
        node?.type === 'CallExpression' &&
        node?.callee?.type === 'Identifier' &&
        node?.callee?.name === 'from' &&
        node?.arguments[0]?.properties[0]?.key?.name === 'bucket'
    ).map(node => node?.arguments[0]?.properties[0]?.value.value)

    return (
      buckets.find(buck => queryBuckets.includes(buck.name))?.orgID || orgId
    )
  }

  const cancel = (queryID?: string) => {
    if (!queryID) {
      Object.values(pending).forEach(c => c())
      setPending({})
      return
    }

    if (!pending.hasOwnProperty(queryID)) {
      return
    }

    pending[queryID]()

    delete pending[queryID]

    setPending(pending)
  }

  const basic = (text: string, vars: VariableMap = {}) => {
    const query = simplify(text, vars)

    // Here we grab the org from the contents of the query, in case it references a sampledata bucket
    const orgID = _getOrg(parse(query))

    const url = `${API_BASE_PATH}api/v2/query?${new URLSearchParams({orgID})}`

    const headers = {
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip',
    }

    const body = {
      query,
      dialect: {annotations: ['group', 'datatype', 'default']},
    }

    const controller = new AbortController()

    const id = UUID()
    const promise = fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    })
      .then(response => {
        if (pending[id]) {
          delete pending[id]
          setPending({...pending})
        }
        return response
      })
      .then(
        (response: Response): Promise<RunQueryResult> => {
          if (response.status === 200) {
            return response.text().then(csv => ({
              type: 'SUCCESS',
              csv,
              bytesRead: csv.length,
              didTruncate: false,
            }))
          }

          if (response.status === RATE_LIMIT_ERROR_STATUS) {
            const retryAfter = response.headers.get('Retry-After')

            return Promise.resolve({
              type: 'RATE_LIMIT_ERROR',
              retryAfter: retryAfter ? parseInt(retryAfter) : null,
              message: RATE_LIMIT_ERROR_TEXT,
            })
          }

          return response.text().then(text => {
            try {
              const json = JSON.parse(text)
              const message = json.message || json.error
              const code = json.code

              return {type: 'UNKNOWN_ERROR', message, code}
            } catch {
              return {
                type: 'UNKNOWN_ERROR',
                message: 'Failed to execute Flux query',
              }
            }
          })
        }
      )
      .catch(e => {
        if (e.name === 'AbortError') {
          return Promise.reject(new CancellationError())
        }

        return Promise.reject(e)
      })

    pending[id] = () => {
      controller.abort()
    }

    setPending({
      ...pending,
    })

    return {
      id,
      promise,
      cancel: () => {
        cancel(id)
      },
    }
  }

  const query = (text: string, vars: VariableMap = {}): Promise<FluxResult> => {
    const result = basic(text, vars)

    return result.promise
      .then(raw => {
        if (raw.type !== 'SUCCESS') {
          throw new Error(raw.message)
        }

        return raw
      })
      .then(raw => {
        return new Promise((resolve, reject) => {
          requestAnimationFrame(() => {
            try {
              const parsed = fromFlux(raw.csv)
              resolve({
                source: text,
                parsed,
                error: null,
              } as FluxResult)
            } catch (e) {
              reject(e)
            }
          })
        })
      })
  }

  const isInitialized = true

  return (
    <GlobalQueryContext.Provider
      value={{
        query,
        cancelQueries,
        addQuery,
        handleSubmit,
        isInitialized,
        changeExpiration,
        refreshQueries,
      }}
    >
      {children}
    </GlobalQueryContext.Provider>
  )
}

const mstp = (state: AppState) => {
  const timeRange = getTimeRangeWithTimezone(state)

  const variables = [
    ...getVariables(state),
    getRangeVariable(TIME_RANGE_START, timeRange),
    getRangeVariable(TIME_RANGE_STOP, timeRange),
  ]

  return {
    variables,
  }
}

const connector = connect(mstp, {})

export default connector(GlobalQueryProvider)
