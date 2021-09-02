// Libraries
import React, {FC, createContext, useState, ReactChild} from 'react'
import {fromFlux} from '@influxdata/giraffe'

import {RunQueryResult} from 'src/shared/apis/query'
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
  QueryScope,
} from 'src/types'

// Utils
import {find} from 'src/flows/context/query'

// Types
import {ASTIM, parseASTIM} from 'src/variables/utils/astim'

import {getOrg} from 'src/organizations/selectors'
import {connect, ConnectedProps, useSelector} from 'react-redux'
import {getTimeRangeWithTimezone} from 'src/dashboards/selectors'
import {getVariables} from 'src/variables/selectors'
import {getRangeVariable} from 'src/variables/utils/getTimeRangeVars'
import {
  TIME_RANGE_START,
  TIME_RANGE_STOP,
  WINDOW_PERIOD,
} from 'src/variables/constants'
import {hashCode} from 'src/shared/apis/queryCache'
import {FromFluxResult, FluxDataType, Table} from '@influxdata/giraffe'
import {
  RATE_LIMIT_ERROR_STATUS,
  RATE_LIMIT_ERROR_TEXT,
} from 'src/cloud/constants'
import {parse, format_from_js_file} from '@influxdata/flux'
import {propertyTime} from 'src/shared/utils/getMinDurationFromAST'
import {SELECTABLE_TIME_RANGES} from 'src/shared/constants/timeRanges'

type Tags = Set<string> | null

interface OwnProps {
  children: ReactChild
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

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

interface QueryResult {
  flux: FluxResult
  timeRange: TimePeriod
}

const DEFAULT_TTL = 10
const TEN_MINUTES = 60 * 1000 * 10

interface QuerySignature {
  destroy: () => void
  bucket: string
  query: string
}

class Query implements QuerySignature {
  private vars: VariableMap
  private astim: ASTIM
  private orgId: string
  private abortController: AbortController
  private lastRun: number | null
  private baseUrl: string
  private token: string | null

  public id: string
  public status: RemoteDataState
  public tags: Tags
  public result: QueryResult
  public ttl: number

  constructor(
    orgId: string,
    query: string,
    override?: QueryScope,
    ttl = DEFAULT_TTL,
    tags: Tags = null
  ) {
    this.reset()
    this.astim = parseASTIM(query)
    this.id = Query.hash(query)

    if (!tags) {
      tags = new Set<string>()
    }

    this.ttl = ttl
    this.vars = override?.vars
    this.tags = tags
    this.query = query
    this.orgId = override?.org ?? orgId
    this.baseUrl = override?.region || window.location.origin
    this.token = override?.token
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

    // this.cancel()
  }

  public clearResult() {
    console.log('Clearing...')
    this.result = {
      flux: {
        source: this.astim.getQuery(),
        parsed: null,
      },
      timeRange: {
        start: 1,
        end: 1,
      },
    }
  }

  private setResult(result: string, status: RemoteDataState): void {
    this.lastRun = Date.now()
    console.log('Parsing Result')
    this.result = {
      flux: {
        source: this.astim.getQuery(),
        parsed: fromFlux(result),
      },
      timeRange: {
        start: 1,
        end: 1,
      },
    }
    console.log('Parsed Result')

    if (!!result) {
      setTimeout(
        function() {
          this.clearResult()
        }.bind(this),
        this.ttl * 1000
      )
    }
    this.status = status
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

    this.astim = parseASTIM(format_from_js_file(ast))
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
    return this.astim.getQuery()
  }

  set query(query: string) {
    const astim = parseASTIM(query)
    this.astim = astim
  }

  cancel(tags: Tags = null) {
    if (!this.hasTags(tags)) {
      return
    }

    console.log('Cancellingggg')

    if (this.status === RemoteDataState.Loading) {
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

  public simplify = () => {
    const ast = this.astim.getAST()
    const usedVars = _getVars(ast, this.vars)

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

  // Latest
  public run(): Promise<FluxResult> {
    if (!this.isExpired()) {
      console.log('returning Cached result')
      return new Promise(resolve => {
        resolve(this.result.flux)
      })
    }
    
    // this.cancel()
    this.status = RemoteDataState.Loading
    
    console.log('running now...')

    return this.basic()
      .then(raw => {
        console.log('in run then')
        if (raw.type !== 'SUCCESS') {
          throw new Error(raw.message)
        }

        return raw
      })
      .then(raw => {
        return new Promise((resolve, reject) => {
          raw
          console.log('in run then2')
          // requestAnimationFrame(() => {
            try {
              resolve({
                source: this.astim.getQuery(),
                parsed: this.result.flux.parsed,
                error: null,
              } as FluxResult)
            } catch (e) {
              reject(e)
            }
          // })
        })
      })
  }

  public basic() {
    const query = this.simplify()

    // Here we grab the org from the contents of the query, in case it references a sampledata bucket
    const orgID = this.orgId

    const url = `${this.baseUrl}/api/v2/query?${new URLSearchParams({orgID})}`
    // console.log(url)

    const headers = {
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip',
    }

    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`
    }

    // console.log(headers)

    const body = {
      query,
      dialect: {annotations: ['group', 'datatype', 'default']},
    }

    return fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: this.abortController.signal,
    })
      .then(
        (response: Response): Promise<RunQueryResult> => {
          console.log('in basic then')
          if (response.status === 200) {
            return response.text().then(csv => {
              console.log('in basic then', this.astim.getQuery())
              this.setResult(csv, RemoteDataState.Done)

              return {
                type: 'SUCCESS',
                csv,
                bytesRead: csv.length,
                didTruncate: false,
              }
            })
          }

          if (response.status === RATE_LIMIT_ERROR_STATUS) {
            const retryAfter = response.headers.get('Retry-After')
            this.setResult(RATE_LIMIT_ERROR_TEXT, RemoteDataState.Error)

            return Promise.resolve({
              type: 'RATE_LIMIT_ERROR',
              retryAfter: retryAfter ? parseInt(retryAfter) : null,
              message: RATE_LIMIT_ERROR_TEXT,
            })
          }

          return response.text().then(text => {
            let result

            try {
              const json = JSON.parse(text)
              const message = json.message || json.error
              const code = json.code

              result = {type: 'UNKNOWN_ERROR', message, code}
            } catch {
              result = {
                type: 'UNKNOWN_ERROR',
                message: 'Failed to execute Flux query',
              }
            }

            this.setResult(result.message, RemoteDataState.Error)
            return result
          })
        }
      )
      .catch(e => {
        if (e.name === 'AbortError') {
          return Promise.reject(new CancellationError())
        }

        return Promise.reject(e)
      })
  }
}

const _getGlobalDefinedVars = (usedVars: VariableMap) => {
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

const _getQueryDefinedVars = (ast: File) => {
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

const _getJoinedVars = (
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

const _getTaskParams = (ast: File) => {
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

const _getVarVals = (usedVars: VariableMap, ast: File) => {
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

export interface GlobalQueryContextType {
  refreshQueries: () => void
  // cancelQueries: (tags?: Tags) => void
  getQuery: (
    query: string,
    override?: QueryScope,
    tags?: Tags,
    id?: string
  ) => Query
  isInitialized: boolean
  changeExpiration: (ttl: number) => void
}

export const DEFAULT_GLOBAL_QUERY_CONTEXT: GlobalQueryContextType = {
  refreshQueries: () => {},
  // cancelQueries: (_: Tags) => {},
  getQuery: (_: string, __?: QueryScope, ___?: Tags, ____?: string) => null,
  isInitialized: false,
  changeExpiration: (_: number) => {},
}

export const GlobalQueryContext = createContext<GlobalQueryContextType>(
  DEFAULT_GLOBAL_QUERY_CONTEXT
)

const GlobalQueryProvider: FC<Props> = ({children}) => {
  // const buckets = useSelector((state: AppState) => getSortedBuckets(state))
  const orgId = useSelector(getOrg).id
  const [queries, setQueries] = useState<Query[]>([])
  const [ttl, changeTTL] = useState(DEFAULT_TTL)

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

  const buildQueryText = (rawQuery: string, override: QueryScope) => {
    const ast = parseASTIM(rawQuery).getAST()
    const varVals = _getVarVals(override?.vars, ast)
    const optionAST = parse(`option v = {\n${varVals}\n}\n`)

    if (varVals.length) {
      ast.body.unshift(optionAST.body[0])
    }

    return format_from_js_file(ast)
  }

  console.log('Queries: ', queries.length)

  const getQuery = (
    rawQuery: string,
    override: QueryScope,
    tags: Tags = null
  ): Query => {
    const text = buildQueryText(rawQuery, override)
    console.log('Finding')
    let query = findQuery(text)
    
    if (query) {
      console.log('Found')
      return query
    }
    
    query = new Query(orgId, text, override, ttl, tags)
    
    queries.push(query)
    
    console.log('Setting query')
    setQueries(queries)
    
    console.log('returning query')
    return query
  }

  // const cancelQueries = async (tags: Tags = null) => {
  //   tags
  //   // await Promise.all(queries.map(query => query.cancel(tags)))
  //   await Promise.all(queries.map(query => query.cancel()))

  //   setQueries(queries)
  // }

  const isInitialized = true

  return (
    <GlobalQueryContext.Provider
      value={{
        // cancelQueries,
        getQuery,
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
