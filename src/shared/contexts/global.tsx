// Libraries
import React, {FC, createContext, useState, ReactChild, useContext} from 'react'

import {RunQueryResult} from 'src/shared/apis/query'
import {CancelBox, QueryScope} from 'src/types'

// Types

// Utils
import {parseASTIM} from 'src/variables/utils/astim'
import {hashCode} from 'src/shared/apis/queryCache'
import {FromFluxResult, FluxDataType, Table} from '@influxdata/giraffe'
import {parse, format_from_js_file} from '@influxdata/flux'
import {getVarVals} from 'src/shared/contexts/query'
import {QueryContext} from 'src/shared/contexts/query'

interface OwnProps {
  children: ReactChild
}

type Props = OwnProps

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

export interface GlobalQueryContextType {
  cancel: (query?: string) => void
  isCached: (query: string, override: QueryScope, basiOnly?: boolean) => boolean
  getQueryHash: (query: string, override: QueryScope) => string
  runGlobalQuery: (query: string, override?: QueryScope) => Promise<FluxResult>
  runGlobalBasic: (
    query: string,
    override?: QueryScope
  ) => CancelBox<RunQueryResult>
  isInitialized: boolean
}

export const DEFAULT_GLOBAL_QUERY_CONTEXT: GlobalQueryContextType = {
  cancel: (_?: string) => null,
  getQueryHash: (_: string, __: QueryScope) => '',
  isCached: (_: string, __: QueryScope, ___?: boolean) => false,
  runGlobalQuery: (_: string, __?: QueryScope) => null,
  runGlobalBasic: (_: string, __?: QueryScope) => null,
  isInitialized: false,
}

// 30 Seconds
const DEFAULT_TTL = 30000

export const GlobalQueryContext = createContext<GlobalQueryContextType>(
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
  //   const orgId = useSelector(getOrg).id
  const [queries, setQueries] = useState({} as QueryMap)
  const [pending, setPending] = useState({} as CancelMap)
  const [queryResponses, setQueryResponses] = useState({} as QueryResponseMap)
  const [basicResponses, setBasicResponses] = useState({} as BasicResponseMap)
  const {basic, query} = useContext(QueryContext)

  const buildQueryText = (rawQuery: string, override: QueryScope) => {
    const ast = parseASTIM(rawQuery).getAST()
    const varVals = getVarVals(override?.vars, ast)
    const optionAST = parse(`option v = {\n${varVals}\n}\n`)

    if (varVals.length) {
      ast.body.unshift(optionAST.body[0])
    }

    return format_from_js_file(ast)
  }

  const updateBasicResponses = (
    queryId: string,
    response: RunQueryResult
  ): void => {
    updateResponses(queryId, response, basicResponses, setBasicResponses)
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

  const runGlobalBasic = (
    rawQuery: string,
    override: QueryScope,
    prebuilt?: boolean
  ): CancelBox<RunQueryResult> => {
    // eslint-disable-next-line no-console
    console.log('Running Global Basic')
    let text = rawQuery
    if (!prebuilt) {
      text = buildQueryText(rawQuery, override)
    }

    const queryObj = getQuery(text)
    const response = basicResponses[queryObj.id]

    if (response) {
      return {
        id: queryObj.id,
        promise: new Promise(resolve => resolve(response)),
        cancel: () => {},
      } as CancelBox<RunQueryResult>
    }

    const result = basic(queryObj.text, override)

    setPending({...pending, [queryObj.id]: result.cancel})

    result.promise.then(res => {
      // console.log({id: queryObj.id, res})
      updateBasicResponses(queryObj.id, res)

      return res
    })

    return {
      id: queryObj.id,
      promise: result.promise,
      cancel: () => {
        cancelPending(queryObj.id, true)
      },
    } as CancelBox<RunQueryResult>
  }

  const runGlobalQuery = (
    rawQuery: string,
    override: QueryScope
  ): Promise<FluxResult> => {
    // eslint-disable-next-line no-console
    console.log('Running Global Query')
    const text = buildQueryText(rawQuery, override)
    const queryObj = getQuery(text)
    const response = queryResponses[queryObj.id]

    if (response) {
      return new Promise(resolve => {
        resolve(response)
      })
    }

    return query(queryObj.text, override).then(res => {
      updateQueryResponses(queryObj.id, res)

      return res
    })
  }

  const cancel = (text?: string, override?: QueryMap) => {
    if (!text) {
      Object.keys(pending).forEach(pid => pending[pid]())
      setPending({})
      return
    }

    const hash = hashCode(buildQueryText(text, override))
    cancelPending(hash, true)
  }

  const isInitialized = true

  const cancelPending = (queryId, callBeforeDeleting = false) => {
    if (!pending[queryId]) {
      return
    }

    callBeforeDeleting && pending[queryId]()

    delete pending[queryId]
    setPending({...pending})
  }

  const updateResponses = (
    queryId: string,
    response: RunQueryResult | FluxResult,
    responses: QueryResponseMap | BasicResponseMap,
    stateCallback: any
  ): void => {
    cancelPending(queryId)
    // NOTE: Mutating directly so that the state gets updated immediately
    // instead of waiting for useState to update the state

    responses[queryId] = response
    stateCallback({...responses})

    setTimeout(() => {
      delete responses[queryId]
      stateCallback({...responses})
    }, DEFAULT_TTL)
  }

  const updateQueryResponses = (queryId: string, response: FluxResult) => {
    updateResponses(queryId, response, queryResponses, setQueryResponses)
  }

  const isCached = (query: string, override: QueryMap, basicOnly = false) => {
    const text = buildQueryText(query, override)
    const hash = hashCode(text)

    return basicOnly ? !!basicResponses[hash] : !!queryResponses[hash]
  }

  const getQueryHash = (query: string, override: QueryScope) => {
    const text = buildQueryText(query, override)

    return hashCode(text)
  }

  return (
    <GlobalQueryContext.Provider
      value={{
        cancel,
        isCached,
        getQueryHash,
        runGlobalBasic,
        runGlobalQuery,
        isInitialized,
      }}
    >
      {children}
    </GlobalQueryContext.Provider>
  )
}

export default GlobalQueryProvider
