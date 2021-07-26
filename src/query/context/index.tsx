// Libraries
import React, {FC, createContext, useState, ReactChild} from 'react'
import {
  runQuery,
  RunQueryResult,
  RunQuerySuccessResult,
} from 'src/shared/apis/query'
import {AppState, RemoteDataState, TimePeriod, Variable} from 'src/types'

// Utils
import {find} from 'src/flows/context/query'

// Types
import {ASTIM, parseASTIM} from 'src/variables/utils/astim'
import {format_from_js_file} from '@influxdata/flux'
import {getOrg} from 'src/organizations/selectors'
import {connect, ConnectedProps, useDispatch, useSelector} from 'react-redux'
import {buildUsedVarsOption} from 'src/variables/utils/buildVarsOption'
import {getTimeRangeWithTimezone} from 'src/dashboards/selectors'
import {getVariables} from 'src/variables/selectors'
import {getRangeVariable} from 'src/variables/utils/getTimeRangeVars'
import {TIME_RANGE_START, TIME_RANGE_STOP} from 'src/variables/constants'
import {hashCode} from 'src/shared/apis/queryCache'
import {getWindowVarsFromVariables} from 'src/variables/utils/getWindowVars'
import {setQueryResults} from 'src/timeMachine/actions/queries'
import {reject} from 'lodash'

type Tags = Set<string> | null

interface QueryResult {
  csv: string
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
      csv: '',
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
      csv: result,
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

  async run(tags: Tags = null): Promise<string> {
    console.log('runnninggggg')
    return new Promise(resolve => {
      if (!this.hasTags(tags) || !this.isExpired()) {
        console.log('is expireddd')
        resolve(this.result.csv)
        return
      }

      this.cancel()
      this.status = RemoteDataState.Loading

      const windowVars = getWindowVarsFromVariables(this.query, this.vars)
      const extern = buildUsedVarsOption(this.query, this.vars, windowVars)

      runQuery(this.orgId, this.query, extern, this.abortController)
        .promise.then((r: RunQueryResult) => {
          console.log('QUERY: ', this.query)
          if (r.type === 'UNKNOWN_ERROR') {
            console.log('Rejecting', {r})
            reject('Issue with the query or AST')
            return
          }
          const csv = (r as RunQuerySuccessResult).csv
          this.setResult(csv)
          this.status = RemoteDataState.Done
          resolve(csv)
        })
        .catch(e => {
          console.log('rejjjj')
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

export interface GlobalQueryContextType {
  queries: Query[]
  refreshQueries: () => void
  runQuery: (query: string) => Promise<string>
  cancelQueries: (tags?: Tags) => void
  addQuery: (query: string, tags?: Tags, id?: string) => Query
  handleSubmit: (rawQuery: string) => Promise<string>
  isInitialized: boolean
  changeExpiration: (ttl: number) => void
}

export const DEFAULT_GLOBAL_QUERY_CONTEXT: GlobalQueryContextType = {
  queries: [],
  refreshQueries: () => {},
  runQuery: (_: string) => null,
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

  const runQuery = async (rawQuery: string, tags?: Tags): Promise<string> => {
    console.log('running local run')
    const query = addQuery(rawQuery, tags)

    console.log('lksdksldklkjakdlsjld')
    return query.run()
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

  const handleSubmit = async (rawQuery): Promise<string> => {
    return runQuery(rawQuery)

    // callback(result)
    // dispatch(
    //   setQueryResults(RemoteDataState.Done, [query.result.csv], 0, null, [])
    // )
  }

  const cancelQueries = async (tags: Tags = null) => {
    await Promise.all(queries.map(query => query.cancel(tags)))

    setQueries(queries)
  }

  const isInitialized = true

  return (
    <GlobalQueryContext.Provider
      value={{
        queries,
        runQuery,
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
