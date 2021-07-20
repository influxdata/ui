// Libraries
import React, {FC, createContext, useState, ReactChild} from 'react'
import {
  runQuery,
  RunQueryResult,
  RunQuerySuccessResult,
} from 'src/shared/apis/query'
import {
  AppState,
  CancelBox,
  RemoteDataState,
  TimePeriod,
  Variable,
} from 'src/types'

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

type Tags = Set<string> | null

interface QueryResult {
  raw: string
  timeRange: TimePeriod
}

class Query {
  private astim: ASTIM
  private orgId: string
  private vars: Variable[] | null
  private abortController: AbortController

  public id
  public status: RemoteDataState
  public tags: Tags
  public result: QueryResult
  public runner: CancelBox<RunQueryResult>

  constructor(orgId: string, query: string, tags: Tags = null) {
    this.id = Query.hash(query)
    if (!tags) {
      this.tags = tags
    }

    this.update(query)
    this.orgId = orgId
    this.tags = new Set<string>()
    this.status = RemoteDataState.NotStarted
    this.abortController = new AbortController()
  }

  static hash(query: string) {
    return hashCode(query)
  }

  async destroy() {
    await this.cancel()
    this.tags = null
    this.astim = null
    this.status = null
    this.result = null
  }

  variables(vars: Variable[] | null = null) {
    if (!vars) {
      return this.vars
    }

    this.vars = vars
  }

  bucket(name: string | null) {
    if (!name) {
      return this.getBucket()
    }

    this.updateBucket(name)
  }

  private getBucket() {
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

  private updateBucket(name: string) {
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
  }

  text() {
    return format_from_js_file(this.astim.getAST())
  }

  update(query: string) {
    const astim = parseASTIM(query)
    this.astim = astim
  }

  run(tags: Tags = null) {
    if (!this.hasTags(tags)) {
      return
    }

    this.cancel()
    this.status = RemoteDataState.Loading

    const windowVars = getWindowVarsFromVariables(this.text(), this.variables())
    const extern = buildUsedVarsOption(
      this.text(),
      this.variables(),
      windowVars
    )
    this.runner = runQuery(
      this.orgId,
      this.text(),
      extern,
      this.abortController
    )

    // do something with AbortController
    this.status = RemoteDataState.Done
  }

  // TODO(Subir): Make this async
  async cancel(tags: Tags = null) {
    if (!this.hasTags(tags)) {
      return
    } else if (this.status === RemoteDataState.Loading) {
      // Abort using AbortController
      try {
        await this.abortController.abort()
      } catch (e) {
        console.error('Error', e)
      }
    }

    this.status = RemoteDataState.NotStarted
  }

  getTags() {
    return this.tags
  }

  addTag(tag: string) {
    this.tags.add(tag)
  }

  removeTag(tag: string) {
    this.tags.has(tag) && this.tags.delete(tag)
  }

  hasTags(tags: Tags = null): boolean {
    // If no tags supplied OR valid tags supplied
    return !tags || Array.from(tags).some(tag => this.tags.has(tag))
  }
}

interface OwnProps {
  children: ReactChild
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

interface GlobalQueryContextType {
  queries: Query[]
  runQuery: (query: string) => Query
  runQueries: (tags: Tags) => void
  deleteQueries: (tags: Tags) => void
  cancelQueries: (tags?: Tags) => void
  getQuery: (id: string) => string
  addQuery: (query: string, tags?: Tags, id?: string) => Query
  updateQuery: (id: string, query: string) => void
  waitForQueries: (tags?: Tags) => void
  handleSubmit: (rawQuery: string) => void
}

export const DEFAULT_GLOBAL_QUERY_CONTEXT: GlobalQueryContextType = {
  queries: [],
  runQuery: (_: string) => null,
  runQueries: (_: Tags) => {},
  deleteQueries: (_: Tags) => {},
  cancelQueries: (_: Tags) => {},
  getQuery: (_: string) => '',
  addQuery: (_: string, __?: Tags, ___?: string) => null,
  updateQuery: (_: string, __: string) => {},
  waitForQueries: (_?: Tags) => '',
  handleSubmit: (_: string) => {},
}

export const GlobalQueryContext = createContext<GlobalQueryContextType>(
  DEFAULT_GLOBAL_QUERY_CONTEXT
)

const GlobalQueryProvider: FC<Props> = ({children, variables}) => {
  const orgId = useSelector(getOrg).id
  const [queries, setQueries] = useState<Query[]>([])

  const findQuery = (query: string): Query => {
    const queryId = Query.hash(query)

    return queries.find(q => q.id === queryId)
  }

  const waitForQueries = async (tags?: Tags) => {
    const running = queries
      .filter(query => query.status === RemoteDataState.Loading)
      .filter(query => {
        if (tags) {
          return query.hasTags(tags)
        }

        return true
      })

    return await Promise.all(running.map(q => q.runner?.promise))
  }

  const runQuery = (rawQuery: string, tags?: Tags): Query => {
    let query = findQuery(rawQuery)
    if (query && query.status === RemoteDataState.Done) {
      return query
    }

    query = addQuery(rawQuery, tags)
    query.run()

    return query
  }

  const getQuery = (id: string) => {
    const query = queries.find(q => id === q.id)

    return query?.text()
  }

  const addQuery = (rawQuery: string, tags: Tags = null): Query => {
    let query = findQuery(rawQuery)

    if (query) {
      return query
    }

    query = new Query(orgId, rawQuery, tags)

    query.variables(variables)
    queries.push(query)

    setQueries(queries)

    return query
  }

  const updateQuery = (id: string, query: string) => {
    setQueries(
      queries.map(q => {
        if (q.id === id) {
          q.update(query)
        }

        return q
      })
    )
  }

  const dispatch = useDispatch()

  const handleSubmit = async rawQuery => {
    const query = runQuery(rawQuery)
    const result = (await query.runner.promise) as RunQuerySuccessResult

    dispatch(setQueryResults(RemoteDataState.Done, [result.csv], 0, null, []))
  }

  const runQueries = (tags: Tags = null) => {
    queries.forEach(query => query.run(tags))
  }

  const deleteQueries = (tags: Tags = null) => {
    const toKeep = queries.filter(query => {
      if (query.hasTags(tags)) {
        query.destroy()
        return false
      }

      return true
    })

    setQueries(toKeep)
  }

  const cancelQueries = async (tags: Tags = null) => {
    await Promise.all(queries.map(query => query.cancel(tags)))

    setQueries(queries)
  }

  return (
    <GlobalQueryContext.Provider
      value={{
        queries,
        runQuery,
        runQueries,
        deleteQueries,
        cancelQueries,
        getQuery,
        addQuery,
        updateQuery,
        waitForQueries,
        handleSubmit,
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
