import React, {
  FC,
  createContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react'

import {useSessionStorage} from 'src/dataExplorer/shared/utils'
import {FluxResult} from 'src/types/flows'
import {
  RemoteDataState,
  ViewProperties,
  SimpleTableViewProperties,
} from 'src/types'
import {SUPPORTED_VISUALIZATIONS} from 'src/visualization'

interface View {
  state: 'table' | 'graph'
  properties: ViewProperties
}

interface ResultsContextType {
  status: RemoteDataState
  result: FluxResult
  time: number
  view: View

  setStatus: (status: RemoteDataState) => void
  setResult: (result: FluxResult) => void
  setView: (view: View) => void
}

const DEFAULT_STATE: ResultsContextType = {
  status: RemoteDataState.NotStarted,
  result: {} as FluxResult,
  time: null,
  view: {
    state: 'table',
    properties: SUPPORTED_VISUALIZATIONS['xy'].initial,
  },

  setStatus: _ => {},
  setResult: _ => {},
  setView: _ => {},
}

export const ResultsContext = createContext<ResultsContextType>(DEFAULT_STATE)

export const ResultsProvider: FC = ({children}) => {
  const [result, setResult] = useState<FluxResult>({} as FluxResult)
  const timeStart = useRef<number>(null)
  const [time, setTime] = useState<number>(null)
  const [status, setStatus] = useState<RemoteDataState>(
    RemoteDataState.NotStarted
  )

  // for display, should be moved
  const [view, setView] = useSessionStorage('dataExplorer.results', {
    state: 'table',
    properties: {
      type: 'simple-table',
      showAll: false,
    } as SimpleTableViewProperties,
  })

  const handleSetResult = useCallback(
    (newResult: Partial<FluxResult>) => {
      setResult({
        ...result,
        ...newResult,
      })
    },
    [result]
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
        view,

        setStatus,
        setResult: handleSetResult,
        setView,
      }}
    >
      {children}
    </ResultsContext.Provider>
  )
}
