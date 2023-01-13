import React, {FC, createContext, useState, useContext, useEffect} from 'react'

import {FluxResult} from 'src/types/flows'
import {RemoteDataState} from 'src/types'
import {ResultsContext} from 'src/dataExplorer/context/results'

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

  useEffect(() => {
    setStatus(statusFromParent)
  }, [statusFromParent])

  useEffect(() => {
    setResult(resultFromParent)
  }, [resultFromParent])

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
