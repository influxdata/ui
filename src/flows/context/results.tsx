import React, {FC, useContext, useEffect, useState, useRef} from 'react'
import {FluxResult} from 'src/types/flows'
import {FlowContext} from 'src/flows/context/flow.current'
import {RemoteDataState} from 'src/types'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

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

export const ResultsContext =
  React.createContext<ResultsContextType>(DEFAULT_CONTEXT)

export const ResultsProvider: FC = ({children}) => {
  const {flow} = useContext(FlowContext)
  const [statuses, setStatuses] = useState<Hash<RemoteDataState>>({})
  const [results, setResults] = useState({...EMPTY_STATE})

  const updates = useRef([])
  const [inc, setInc] = useState(0)

  useEffect(() => {
    setResults({...EMPTY_STATE})
  }, [flow?.id])

  useEffect(() => {
    if (!updates.current.length) {
      return
    }

    let sChange = false
    let rChange = false

    while (updates.current.length) {
      const [t, id, val] = updates.current.pop()
      if (t === 'status') {
        statuses[id] = val
        sChange = true
      }

      if (t === 'result') {
        results[id] = val
        rChange = true
      }
    }

    if (rChange) {
      setResults({...results})
    }

    if (sChange) {
      setStatuses({...statuses})
    }

    setInc(inc + 1)
  }, [inc])

  const value = {
    results,
    setResult: (id: string, result: Partial<FluxResult>) => {
      if (!isFlagEnabled('fastFlows')) {
        results[id] = {
          source: '',
          parsed: null,
          truncated: false,
          bytes: 0,
          ...result,
        }
        setResults({...results})

        return
      }

      updates.current.push(['result', id, result])
      if (updates.current.length > 1) {
        return
      }

      setInc(inc + 1)
    },
    statuses,
    setStatuses: (stats: Partial<Hash<RemoteDataState>>) => {
      if (!isFlagEnabled('fastFlows')) {
        setStatuses(prev => ({
          ...prev,
          ...stats,
        }))

        return
      }

      Object.entries(stats).forEach(([id, stat]) => {
        updates.current.push(['status', id, stat])
      })

      if (updates.current.length > Object.keys(stats).length) {
        return
      }
      setInc(inc + 1)
    },
  }

  return (
    <ResultsContext.Provider value={value}>{children}</ResultsContext.Provider>
  )
}
