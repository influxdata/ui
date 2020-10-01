import React, {FC, useContext, useEffect, useCallback, useMemo} from 'react'
import createPersistedState from 'use-persisted-state'
import {Flow, PipeData} from 'src/types/flows'
import {FlowListContext, FlowListProvider} from 'src/flows/context/flow.list'
import {v4 as UUID} from 'uuid'
import {RemoteDataState} from 'src/types'

const useFlowCurrentState = createPersistedState('current-flow')

export interface FlowContextType {
  id: string | null
  name: string
  flow: Flow | null
  change: (id: string) => void
  add: (data: Partial<PipeData>, index?: number) => string
  update: (flow: Partial<Flow>) => void
  remove: () => void
}

export const DEFAULT_CONTEXT: FlowContextType = {
  id: null,
  name: 'Name this Flow',
  flow: null,
  add: () => '',
  change: () => {},
  update: () => {},
  remove: () => {},
}

export const FlowContext = React.createContext<FlowContextType>(DEFAULT_CONTEXT)

let GENERATOR_INDEX = 0

const getHumanReadableName = (type: string): string => {
  ++GENERATOR_INDEX

  switch (type) {
    case 'data':
      return `Bucket ${GENERATOR_INDEX}`
    case 'queryBuilder':
      return `Metric Selector ${GENERATOR_INDEX}`
    case 'visualization':
      return `Visualization ${GENERATOR_INDEX}`
    case 'markdown':
      return `Markdown ${GENERATOR_INDEX}`
    case 'query':
      return `Flux Script ${GENERATOR_INDEX}`
    default:
      return `Cell ${GENERATOR_INDEX}`
  }
}

export const FlowProvider: FC = ({children}) => {
  const [currentID, setCurrentID] = useFlowCurrentState(null)
  const {flows, add, update, remove} = useContext(FlowListContext)

  const change = useCallback(
    (id: string) => {
      if (!flows || !flows.hasOwnProperty(id)) {
        throw new Error('Flow does note exist')
      }

      setCurrentID(id)
    },
    [currentID]
  )

  const updateCurrent = useCallback(
    (flow: Flow) => {
      update(currentID, {
        ...flows[currentID],
        ...flow,
      })
    },
    [currentID]
  )

  const removeCurrent = useCallback(() => {
    remove(currentID)
  }, [currentID])

  const addPipe = (initial: PipeData, index?: number) => {
    const id = UUID()

    flows[currentID].data.add(id, initial)
    flows[currentID].meta.add(id, {
      title: getHumanReadableName(initial.type),
      visible: true,
      loading: RemoteDataState.NotStarted,
    })

    if (typeof index !== 'undefined') {
      flows[currentID].data.move(id, index + 1)
    }

    return id
  }

  useEffect(() => {
    if (!currentID) {
      const id = add()
      setCurrentID(id)
      return
    }
  }, [currentID])

  return useMemo(() => {
    if (!flows || !flows.hasOwnProperty(currentID)) {
      return null
    }

    return (
      <FlowContext.Provider
        value={{
          id: currentID,
          name,
          flow: flows[currentID],
          add: addPipe,
          update: updateCurrent,
          remove: removeCurrent,
          change,
        }}
      >
        {children}
      </FlowContext.Provider>
    )
  }, [currentID, (flows || {})[currentID]])
}

const CurrentFlow: FC = ({children}) => {
  return (
    <FlowListProvider>
      <FlowProvider>{children}</FlowProvider>
    </FlowListProvider>
  )
}

export default CurrentFlow
