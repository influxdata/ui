import React, {FC, useContext, useMemo, useCallback} from 'react'
import {PipeData, FluxResult} from 'src/types/flows'
import {FlowContext} from 'src/flows/context/flow.current'
import {ResultsContext} from 'src/flows/context/results'
import {RemoteDataState, TimeRange} from 'src/types'

export interface PipeContextType {
  id: string
  data: PipeData
  range: TimeRange
  update: (data: PipeData) => void
  loading: RemoteDataState
  results: FluxResult
  readOnly: boolean
}

export const DEFAULT_CONTEXT: PipeContextType = {
  id: '',
  data: {},
  range: null,
  update: () => {},
  loading: RemoteDataState.NotStarted,
  results: {
    source: '',
    parsed: {},
  } as FluxResult,
  readOnly: false,
}

export const PipeContext = React.createContext<PipeContextType>(DEFAULT_CONTEXT)

interface PipeContextProps {
  id: string
}

export const PipeProvider: FC<PipeContextProps> = ({id, children}) => {
  const {flow, updateData} = useContext(FlowContext)
  const {results, statuses} = useContext(ResultsContext)
  const result = results[id]
  const status = statuses[id]

  const updater = useCallback(
    (data: Partial<PipeData>) => {
      updateData(id, data)
    },
    [flow, updateData]
  )

  return useMemo(() => {
    return (
      <PipeContext.Provider
        value={{
          id: id,
          data: flow.data.byID[id],
          range: flow.range,
          update: updater,
          results: result || {...DEFAULT_CONTEXT.results},
          loading: status || RemoteDataState.NotStarted,
          readOnly: flow.readOnly,
        }}
      >
        {children}
      </PipeContext.Provider>
    )
  }, [flow, id, result, status, children, updater])
}
