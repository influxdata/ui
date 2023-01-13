import React, {FC, createContext, useState, useContext, useEffect} from 'react'

// Contexts
import {ResultsContext} from 'src/dataExplorer/context/results'
import {ResultsViewContext} from 'src/dataExplorer/context/resultsView'
import {PersistanceContext} from 'src/dataExplorer/context/persistance'
import {QueryContext} from 'src/shared/contexts/query'

// Types
import {FluxResult} from 'src/types/flows'
import {RemoteDataState} from 'src/types'
import {LanguageType} from 'src/dataExplorer/components/resources'

// Utils
import {rangeToParam} from 'src/dataExplorer/shared/utils'

const transformSmoothing = (text: string) => {
  // e.g. to smooth by selected column foo. Rough example.
  const shouldSmooth = false

  if (shouldSmooth) {
    text = `import "experimental/polyline"
    ${text}
      |> polyline.rdp(valColumn: "foo", timeColumn: "time")
    `
  }
  return text
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
  const [status, setStatus] = useState<RemoteDataState>(
    RemoteDataState.NotStarted
  )
  const {status: statusFromParent, result: resultFromParent} =
    useContext(ResultsContext)
  const {viewOptions} = useContext(ResultsViewContext)
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

    // TODO: tranform functions, based on viewOptions change
    const text = transformSmoothing(queryText)

    if (text == queryText) {
      return
    }

    setStatus(RemoteDataState.Loading)
    query(
      text,
      {
        vars: rangeToParam(range),
      },
      {
        language: resource?.language ?? LanguageType.SQL,
        bucket: selection.bucket,
      }
    )
      .then(r => {
        setResult(r)
        setStatus(RemoteDataState.Done)
      })
      .catch(e => {
        setResult({
          source: text,
          parsed: null,
          error: e.message,
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
