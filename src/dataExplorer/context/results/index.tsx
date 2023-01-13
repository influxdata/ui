import React, {FC, createContext, useState, useRef, useEffect} from 'react'

import {FluxResult} from 'src/types/flows'
import {RemoteDataState} from 'src/types'

interface ResultsContextType {
  status: RemoteDataState
  result: FluxResult
  time: number

  setStatus: (status: RemoteDataState) => void
  setResult: (result: FluxResult) => void
}

const DEFAULT_STATE: ResultsContextType = {
  status: RemoteDataState.NotStarted,
  result: {} as FluxResult,
  time: null,

  setStatus: _ => {},
  setResult: _ => {},
}

export const ResultsContext = createContext<ResultsContextType>(DEFAULT_STATE)

export const ResultsProvider: FC = ({children}) => {
  const [result, setResult] = useState<FluxResult>({} as FluxResult)
  const timeStart = useRef<number>(null)
  const [time, setTime] = useState<number>(null)
  const [status, setStatus] = useState<RemoteDataState>(
    RemoteDataState.NotStarted
  )

  useEffect(() => {
    let running = false
    const check = () => {
      if (!running) {
        return
      }

      setTime(Date.now() - timeStart.current)

      window.requestAnimationFrame(check)
    }

    if (status === RemoteDataState.Loading) {
      if (!timeStart.current) {
        timeStart.current = Date.now()
      }

      running = true
      window.requestAnimationFrame(check)
    } else if (
      status === RemoteDataState.Done ||
      status === RemoteDataState.Error
    ) {
      running = false
      timeStart.current = null
    }

    return () => {
      running = false
    }
  }, [status])

  return (
    <ResultsContext.Provider
      value={{
        status,
        result,
        time,

        setStatus,
        setResult,
      }}
    >
      {children}
    </ResultsContext.Provider>
  )
}
