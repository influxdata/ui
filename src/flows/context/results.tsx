import React, {FC, useContext, useEffect, useState} from 'react'
import {FluxResult} from 'src/types/flows'
import {FlowContext} from 'src/flows/context/flow.current'
import {RemoteDataState} from 'src/types'

interface Hash<T> {
  [key: string]: T
}

const EMPTY_STATE = {} as Hash<FluxResult>

interface ResultsContextType {
  results: Hash<FluxResult>
  setResult: (id: string, result: Partial<FluxResult>) => void
  statuses: Hash<RemoteDataState>
  setStatuses: (status: Partial<Hash<RemoteDataState>>) => void
}

const DEFAULT_CONTEXT: ResultsContextType = {
  results: EMPTY_STATE,
  setResult: (_: string, __: Partial<FluxResult>) => {},
  statuses: {},
  setStatuses: _ => {},
}

export const ResultsContext = React.createContext<ResultsContextType>(
  DEFAULT_CONTEXT
)

export const ResultsProvider: FC = ({children}) => {
  const {flow} = useContext(FlowContext)
  const [statuses, setStatuses] = useState<Hash<RemoteDataState>>({})
  const [results, setResults] = useState({...EMPTY_STATE})

  useEffect(() => {
    setResults({...EMPTY_STATE})
  }, [flow?.id])

  const value = {
    results,
    setResult: (id: string, result: Partial<FluxResult>) => {
      results[id] = {
        source: '',
        parsed: null,
        ...results[id],
        ...result,
      }
      setResults({
        ...results,
      })
    },
    statuses,
    setStatuses: (stats: Partial<Hash<RemoteDataState>>) => {
      const hasChanged = Object.entries(stats).reduce((a, [k, v]) => {
        if (statuses[k] === v) {
          return a
        }

        statuses[k] = v
        return true
      }, false)

      if (!hasChanged) {
        return
      }

      setStatuses({
        ...statuses,
      })
    },
  }

  return (
    <ResultsContext.Provider value={value}>{children}</ResultsContext.Provider>
  )
}
