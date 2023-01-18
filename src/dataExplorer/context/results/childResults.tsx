import React, {FC, createContext, useState, useContext, useEffect} from 'react'

// Contexts
import {ResultsContext} from 'src/dataExplorer/context/results'
import {
  ResultsViewContext,
  ViewOptions,
} from 'src/dataExplorer/context/resultsView'
import {PersistanceContext} from 'src/dataExplorer/context/persistance'
import {QueryContext, SqlQueryModifiers} from 'src/shared/contexts/query'

// Types
import {FluxResult} from 'src/types/flows'
import {RemoteDataState} from 'src/types'
import {LanguageType} from 'src/dataExplorer/components/resources'

// Utils
import {rangeToParam} from 'src/dataExplorer/shared/utils'

const modifiersToApply = (viewOptions: ViewOptions): SqlQueryModifiers => {
  const prepend = []
  const append = []

  // 1. groupby first
  if (viewOptions.groupby?.length) {
    append.push(
      `|> group(columns: [${viewOptions.groupby
        .map(columnName => `"${columnName}"`)
        .join(',')}])`
    )
  }

  // 2. smoothing transformation next
  // e.g. to smooth by selected column foo. Rough example.
  const shouldSmooth = false
  if (shouldSmooth) {
    prepend.push(`import "experimental/polyline"`)
    // append.push(`|> polyline.rdp(valColumn: "foo", timeColumn: "time")`) // TODO
  }

  return Boolean(prepend.length + append.length)
    ? {
        prepend: prepend.join('\n'),
        append: append.join('\n'),
      }
    : null
}

interface ChildResultsContextType {
  status: RemoteDataState
  result: FluxResult

  setStatus: (status: RemoteDataState) => void
  setResult: (result: FluxResult) => void
}

const DEFAULT_STATE: ChildResultsContextType = {
  status: RemoteDataState.NotStarted,
  result: {} as FluxResult,

  setStatus: _ => {},
  setResult: _ => {},
}

export const ChildResultsContext =
  createContext<ChildResultsContextType>(DEFAULT_STATE)

export const ChildResultsProvider: FC = ({children}) => {
  const [result, setResult] = useState<FluxResult>({} as FluxResult)
  const [queryModifers, setQueryModifiers] = useState(null)
  const [status, setStatus] = useState<RemoteDataState>(
    RemoteDataState.NotStarted
  )
  const {status: statusFromParent, result: resultFromParent} =
    useContext(ResultsContext)
  const {selectedViewOptions: viewOptions} = useContext(ResultsViewContext)
  const {
    query: queryText,
    selection,
    resource,
    range,
  } = useContext(PersistanceContext)
  const {query} = useContext(QueryContext)

  useEffect(() => {
    setStatus(statusFromParent)
  }, [statusFromParent])

  useEffect(() => {
    setResult(resultFromParent)
  }, [resultFromParent])

  useEffect(() => {
    if (resource?.language !== LanguageType.SQL) {
      return
    }

    const cannotRunIoxSqlMethod = !selection?.bucket
    if (cannotRunIoxSqlMethod) {
      return
    }

    const sqlQueryModifiers = modifiersToApply(viewOptions)
    const previousQueryModifiers = queryModifers
    setQueryModifiers(sqlQueryModifiers)

    if (sqlQueryModifiers === previousQueryModifiers) {
      return
    }

    setStatus(RemoteDataState.Loading)
    query(
      queryText,
      {
        vars: rangeToParam(range),
      },
      {
        language: resource?.language ?? LanguageType.SQL,
        bucket: selection.bucket,
        sqlQueryModifiers,
      }
    )
      .then(result => {
        setResult(result)
        setStatus(RemoteDataState.Done)
      })
      .catch(error => {
        setResult({
          source: queryText,
          parsed: null,
          error: error.message,
          truncated: false,
          bytes: 0,
        })
        setStatus(RemoteDataState.Error)
      })
  }, [resultFromParent, viewOptions, setStatus, setResult])

  return (
    <ChildResultsContext.Provider
      value={{
        status,
        result,

        setStatus,
        setResult,
      }}
    >
      {children}
    </ChildResultsContext.Provider>
  )
}
