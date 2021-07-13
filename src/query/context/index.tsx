// Libraries
import React, {FC, createContext, useState} from 'react'
import {runQuery} from 'src/shared/apis/query'
import {AppState, RemoteDataState, TimePeriod, Variable} from 'src/types'

// Utils
import {find} from 'src/flows/context/query'

// Types
import {ASTIM, parseASTIM} from 'src/variables/utils/astim'
import {format_from_js_file} from '@influxdata/flux'
import {getOrg} from 'src/organizations/selectors'
import {connect, ConnectedProps, useSelector} from 'react-redux'
import {buildUsedVarsOption} from 'src/variables/utils/buildVarsOption'
import {getTimeRangeWithTimezone} from 'src/dashboards/selectors'
import {getVariables} from 'src/variables/selectors'
import {getRangeVariable} from 'src/variables/utils/getTimeRangeVars'
import {TIME_RANGE_START, TIME_RANGE_STOP} from 'src/variables/constants'

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

  status: RemoteDataState
  tags: Tags
  result: QueryResult

  constructor(orgId: string, query: string, tags: Tags = null) {
    if (!tags) {
      this.tags = tags
    }

    this.update(query)
    this.orgId = orgId
    this.tags = new Set<string>()
    this.status = RemoteDataState.NotStarted
    this.abortController = new AbortController()
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
        node?.arguments[0]?.properties[0]?.key?.name === 'bucket'
    ).map(node => node?.arguments[0]?.properties[0]?.value.value)
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
        node?.arguments[0]?.properties[0]?.key?.name === 'bucket'
    ).map(
      node =>
        (node.arguments[0].properties[0].value.location.source = `"${name}"`)
    )
  }

  get() {
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

    this.status = RemoteDataState.Loading
    const extern = buildUsedVarsOption(this.get(), this.variables())
    runQuery(this.orgId, this.get(), extern, this.abortController)
      .promise.then((...args) => {
        console.log({args})
      })
      .catch((error: Error) => {
        console.log({error})
      })
    // do something with AbortController
    this.status = RemoteDataState.Done
  }

  // TODO(Subir): Make this async
  cancel(tags: Tags = null) {
    if (!this.hasTags(tags)) {
      return
    }
    // Abort using AbortController

    this.abortController.abort()
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
  children: (r) => JSX.Element
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

interface QueryContextType {
  queries: Query[]
  runQueries: (tags: Tags) => void
  deleteQueries: (tags: Tags) => void
  cancelQueries: (tags: Tags) => void
  addQuery: (query: string, tags: Tags) => void
}

export const DEFAULT_QUERY_CONTEXT: QueryContextType = {
  queries: [],
  runQueries: (_: Tags) => {},
  deleteQueries: (_: Tags) => {},
  cancelQueries: (_: Tags) => {},
  addQuery: (_: string, __: Tags) => {},
}

export const QueryBatchContext = createContext<QueryContextType>(
  DEFAULT_QUERY_CONTEXT
)

const QueryProvider: FC<Props> = ({children, variables}) => {
  const orgId = useSelector(getOrg).id
  const [queries, setQueries] = useState<Query[]>([])

  const addQuery = (rawQuery: string, tags: Tags = null) => {
    const query = new Query(orgId, rawQuery, tags)
    query.variables(variables)
    queries.push(query)

    setQueries(queries)
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

  const cancelQueries = (tags: Tags = null) => {
    queries.forEach(query => query.cancel(tags))

    setQueries(queries)
  }

  return (
    <QueryBatchContext.Provider
      value={{
        queries,
        runQueries,
        deleteQueries,
        cancelQueries,
        addQuery,
      }}
    >
      {children}
    </QueryBatchContext.Provider>
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

export default connector(QueryProvider)
