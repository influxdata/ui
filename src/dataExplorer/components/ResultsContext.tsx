import React, {FC, createContext, useState} from 'react'
import {FluxResult} from 'src/types/flows'
import {RemoteDataState} from 'src/types'

interface ResultsContextType {
  status: RemoteDataState
  result: FluxResult

  setStatus: (status: RemoteDataState) => void
  setResult: (result: FluxResult) => void
}

export const ResultsContext = createContext<ResultsContextType>({
  status: RemoteDataState.NotStarted,
  result: {} as FluxResult,

  setStatus: _ => {},
  setResult: _ => {},
})

export const ResultsProvider: FC = ({children}) => {
  const [result, setResult] = useState<FluxResult>({} as FluxResult)
  const [status, setStatus] = useState<RemoteDataState>(
    RemoteDataState.NotStarted
  )
  return (
    <ResultsContext.Provider
      value={{
        status,
        result,

        setStatus,
        setResult,
      }}
    >
      {children}
    </ResultsContext.Provider>
  )
}
