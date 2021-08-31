import React, {FC, useContext, useEffect, useState} from 'react'
import {FluxResult} from 'src/types/flows'
import {FlowContext} from 'src/flows/context/flow.current'

interface Hash<T> {
  [key: string]: T
}

const EMPTY_STATE = {} as Hash<FluxResult>

interface ResultsContextType {
  results: Hash<FluxResult>
  setResult: (id: string, result: Partial<FluxResult>) => void
}

const DEFAULT_CONTEXT: ResultsContextType = {
  results: EMPTY_STATE,
  setResult: (_: string, __: Partial<FluxResult>) => {},
}

export const ResultsContext = React.createContext<ResultsContextType>(
  DEFAULT_CONTEXT
)

export const ResultsProvider: FC = ({children}) => {
  const {id} = useContext(FlowContext)
  const [results, setResults] = useState({...EMPTY_STATE})

  useEffect(() => {
    setResults({...EMPTY_STATE})
  }, [id])

  const value = {
    results,
    setResult: (id: string, result: Partial<FluxResult>) => {
      setResults({
        ...results,
        [id]: {
          source: '',
          parsed: null,
          ...result,
        },
      })
    },
  }

  return (
    <ResultsContext.Provider value={value}>{children}</ResultsContext.Provider>
  )
}
