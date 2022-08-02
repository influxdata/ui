import React, {FC, useContext, useEffect, useMemo, useCallback} from 'react'
import {PipeData, FluxResult} from 'src/types/flows'
import {FlowContext} from 'src/flows/context/flow.current'
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {QueryScope} from 'src/shared/contexts/query'
import {ResultsContext} from 'src/flows/context/results'
import {RemoteDataState, TimeRange} from 'src/types'
import {useHistory, useLocation} from 'react-router-dom'

export interface PipeContextType {
  id: string
  data: PipeData
  range: TimeRange
  update: (data: PipeData) => void
  loading: RemoteDataState
  results: FluxResult
  readOnly: boolean
  scope: QueryScope
}

const DEFAULT_CONTEXT: PipeContextType = {
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
  scope: {
    region: '',
    org: '',
  },
}

export const PipeContext = React.createContext<PipeContextType>(DEFAULT_CONTEXT)

interface PipeContextProps {
  id: string
}

export const PipeProvider: FC<PipeContextProps> = ({id, children}) => {
  const {flow, updateData} = useContext(FlowContext)
  const {getPanelQueries} = useContext(FlowQueryContext)
  const {results, statuses} = useContext(ResultsContext)
  const result = results[id]
  const status = statuses[id]

  const history = useHistory()
  const {search} = useLocation()

  const panel = new URLSearchParams(search).get('panel')
  const statusValues = Object.values(statuses).every(
    stat => stat !== undefined && stat !== RemoteDataState.Loading
  )

  useEffect(() => {
    if (panel && statusValues) {
      document.getElementById(panel)?.scrollIntoView()
      setTimeout(() => {
        // then remove the deep linked panel from the URL?
        history.push(window.location.pathname)
      }, 1000)
    }
  }, [history, panel, statusValues])

  const updater = useCallback(
    (data: Partial<PipeData>) => {
      updateData(id, data)
    },
    [flow, updateData]
  )

  const scope = getPanelQueries(id)?.scope

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
          scope: scope,
        }}
      >
        {children}
      </PipeContext.Provider>
    )
  }, [flow, id, result, status, children, updater, scope])
}
