// Libraries
import React, {FC, createContext, useState, ReactChild} from 'react'
import {fromFlux} from '@influxdata/giraffe'

import {RunQueryResult} from 'src/shared/apis/query'
import {CancellationError, QueryScope} from 'src/types'

// Utils

// Types
import {parseASTIM} from 'src/variables/utils/astim'

import {getOrg} from 'src/organizations/selectors'
import {useSelector} from 'react-redux'
import {hashCode} from 'src/shared/apis/queryCache'
import {FromFluxResult, FluxDataType, Table} from '@influxdata/giraffe'
import {
  RATE_LIMIT_ERROR_STATUS,
  RATE_LIMIT_ERROR_TEXT,
} from 'src/cloud/constants'
import {parse, format_from_js_file} from '@influxdata/flux'
import {
  simplify,
  _addWindowPeriod,
  _getGlobalDefinedVars,
  _getJoinedVars,
  _getQueryDefinedVars,
  _getTaskParams,
  _getVars,
  _getVarVals,
} from './utils'

interface OwnProps {
  children: ReactChild
}

type Props = OwnProps

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

export interface FluxResult {
  source: string // the query that was used to generate the flux
  parsed: InternalFromFluxResult // the parsed result
  error?: string // any error that might have happend while fetching
}

export interface GlobalQueryContextType2 {
  cancel: (query?: string) => void
  runQuery: (query: string, override?: QueryScope) => Promise<FluxResult>
  runBasic: (query: string, override?: QueryScope) => Promise<RunQueryResult>
  isInitialized: boolean
}

export const DEFAULT_GLOBAL_QUERY_CONTEXT: GlobalQueryContextType2 = {
  cancel: (_?: string) => null,
  runQuery: (_: string, __?: QueryScope) => null,
  runBasic: (_: string, __?: QueryScope) => null,
  isInitialized: false,
}

export const GlobalQueryContext = createContext<GlobalQueryContextType2>(
  DEFAULT_GLOBAL_QUERY_CONTEXT
)
interface Query {
  id: string
  text: string
}

interface CancelMap {
  [key: string]: () => void
}

interface QueryMap {
  [key: string]: Query
}

interface QueryResponseMap {
  [key: string]: FluxResult
}
interface BasicResponseMap {
  [key: string]: RunQueryResult
}

const GlobalQueryProvider: FC<Props> = ({children}) => {
  // const buckets = useSelector((state: AppState) => getSortedBuckets(state))
  const orgId = useSelector(getOrg).id
  const [queries, setQueries] = useState({} as QueryMap)
  const [pending, setPending] = useState({} as CancelMap)
  const [queryResponses, setQueryResponses] = useState({} as QueryResponseMap)
  const [basicResponses, setBasicResponses] = useState({} as BasicResponseMap)

  const buildQueryText = (rawQuery: string, override: QueryScope) => {
    const ast = parseASTIM(rawQuery).getAST()
    const varVals = _getVarVals(override?.vars, ast)
    const optionAST = parse(`option v = {\n${varVals}\n}\n`)

    if (varVals.length) {
      ast.body.unshift(optionAST.body[0])
    }

    return format_from_js_file(ast)
  }

  const getQuery = (text: string): Query => {
    const hash = hashCode(text)
    let queryObj = queries[hash]
    if (!queryObj) {
      queryObj = {
        text,
        id: hash,
      } as Query
      setQueries({...queries, [hash]: queryObj})
    }

    return queryObj
  }

  const runBasic = (
    rawQuery: string,
    override: QueryScope
  ): Promise<RunQueryResult> => {
    const text = buildQueryText(rawQuery, override)
    const queryObj = getQuery(text)

    const response = basicResponses[queryObj.id]
    if (response) {
      return new Promise(resolve => {
        resolve(response)
      })
    }

    return basic(queryObj, override)
  }

  const runQuery = (
    rawQuery: string,
    override: QueryScope
  ): Promise<FluxResult> => {
    const text = buildQueryText(rawQuery, override)
    const queryObj = getQuery(text)

    const response = queryResponses[queryObj.id]
    if (response) {
      return new Promise(resolve => {
        resolve(response)
      })
    }

    return query(queryObj, override)
  }

  const cancel = (text = null) => {
    if (!text) {
      Object.keys(pending).forEach(pid => pending[pid]())
      setPending({})
      return
    }

    const hash = hashCode(text)
    pending[hash]()
    delete pending[hash]

    setPending(pending)
  }

  const isInitialized = true

  const basic = (queryObj: Query, override?: QueryScope) => {
    const query = simplify(queryObj.text, override?.vars || {})

    // Here we grab the org from the contents of the query, in case it references a sampledata bucket
    const orgID = override?.org || orgId

    const url = `${override?.region ||
      window.location.origin}/api/v2/query?${new URLSearchParams({orgID})}`

    const headers = {
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip',
    }

    if (override?.token) {
      headers['Authorization'] = `Token ${override.token}`
    }

    const body = {
      query,
      dialect: {annotations: ['group', 'datatype', 'default']},
    }

    const controller = new AbortController()

    const promise = fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    })
      .then(
        (response: Response): Promise<RunQueryResult> => {
          if (response.status === 200) {
            return response.text().then(csv => {
              if (pending[queryObj.id]) {
                delete pending[queryObj.id]
                setPending({...pending})
              }

              const result = {
                type: 'SUCCESS',
                csv,
                bytesRead: csv.length,
                didTruncate: false,
              } as RunQueryResult

              updateBasicResponses(queryObj.id, result)
              return result
            })
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

    pending[queryObj.id] = () => {
      controller.abort()
    }

    setPending({
      ...pending,
    })

    return promise
  }

  const updateBasicResponses = (queryId: string, response: RunQueryResult) => {
    setBasicResponses({...basicResponses, [queryId]: response})
    setTimeout(() => {
      delete basicResponses[queryId]
      setBasicResponses(basicResponses)
    }, 20000)
  }

  const updateQueryResponses = (queryId: string, response: FluxResult) => {
    setQueryResponses({...queryResponses, [queryId]: response})
    setTimeout(() => {
      delete queryResponses[queryId]
      setQueryResponses(queryResponses)
    }, 20000)
  }

  const query = (
    queryObj: Query,
    override?: QueryScope
  ): Promise<FluxResult> => {
    const result = basic(queryObj, override)

    return result
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
              const result = {
                source: queryObj.text,
                parsed,
                error: null,
              } as FluxResult
              updateQueryResponses(queryObj.id, result)

              resolve(result)
            } catch (e) {
              reject(e)
            }
          })
        })
      })
  }

  return (
    <GlobalQueryContext.Provider
      value={{
        cancel,
        runBasic,
        runQuery,
        isInitialized,
      }}
    >
      {children}
    </GlobalQueryContext.Provider>
  )
}

export default GlobalQueryProvider
