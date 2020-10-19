import React, {FC, useContext, useMemo} from 'react'
import {PipeData, FluxResult} from 'src/types/flows'
import {FlowContext} from 'src/flows/context/flow.current'
import {ResultsContext} from 'src/flows/context/results'
import {RemoteDataState} from 'src/types'
import {QueryContext} from './query'

export interface PipeContextType {
  id: string
  data: PipeData
  queryText: string
  update: (data: PipeData) => void
  loading: RemoteDataState
  results: FluxResult
  readOnly: boolean
}

export const DEFAULT_CONTEXT: PipeContextType = {
  id: '',
  data: {},
  queryText: '',
  update: () => {},
  loading: RemoteDataState.NotStarted,
  results: {
    source: '',
    raw: '',
    parsed: {},
  } as FluxResult,
  readOnly: false,
}

export const PipeContext = React.createContext<PipeContextType>(DEFAULT_CONTEXT)

interface PipeContextProps {
  id: string
}

export const PipeProvider: FC<PipeContextProps> = ({id, children}) => {
  const {flow} = useContext(FlowContext)
  const results = useContext(ResultsContext)
  const {generateMap} = useContext(QueryContext)

  const stages = useMemo(() => generateMap(), [generateMap, flow.data.get(id)])
  const queryText =
    stages.filter(stage => stage.instances.includes(id))[0]?.text || ''

  const updater = (_data: PipeData) => {
    flow.data.update(id, _data)
  }

  let _result

  try {
    _result = results.get(id)
  } catch (_e) {
    _result = {...DEFAULT_CONTEXT.results}
  }

  return (
    <PipeContext.Provider
      value={{
        id: id,
        data: flow.data.get(id),
        queryText,
        update: updater,
        results: _result,
        loading: flow.meta.get(id).loading,
        readOnly: flow.readOnly,
      }}
    >
      {children}
    </PipeContext.Provider>
  )
}
