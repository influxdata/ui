import React, {FC, createContext, useState} from 'react'
import {FluxResult} from 'src/types/flows'
import {RemoteDataState} from 'src/types'

interface ResultsContextType {
  status: RemoteDataState
  result: FluxResult
  time: number

  setStatus: (status: RemoteDataState) => void
  setResult: (result: FluxResult) => void
  setTime: (time: number) => void
}

export const ResultsContext = createContext<ResultsContextType>({
  status: RemoteDataState.NotStarted,
  result: {} as FluxResult,
  time: 0,

  setStatus: _ => {},
  setResult: _ => {},
  setTime: _ => {},
})

export const ResultsProvider: FC = ({children}) => {
  const [result, setResult] = useState<FluxResult>({} as FluxResult)
  const [time, setTime] = useState<number>(0)
  const [status, setStatus] = useState<RemoteDataState>(
    RemoteDataState.NotStarted
  )
  return (
    <ResultsContext.Provider
      value={{
        status,
        result,
        time,

        setStatus,
        setResult,
        setTime,
      }}
    >
      {children}
    </ResultsContext.Provider>
  )
}
