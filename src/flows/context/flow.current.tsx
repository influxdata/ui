import React, {FC, useContext, useCallback, useMemo} from 'react'
import {Flow, PipeData} from 'src/types/flows'
import {FlowListContext, FlowListProvider} from 'src/flows/context/flow.list'
import {v4 as UUID} from 'uuid'
import {RemoteDataState} from 'src/types'
import {PROJECT_NAME} from 'src/flows'

export interface FlowContextType {
  id: string | null
  name: string
  flow: Flow | null
  add: (data: Partial<PipeData>, index?: number) => string
  update: (flow: Partial<Flow>) => void
}

export const DEFAULT_CONTEXT: FlowContextType = {
  id: null,
  name: `Name this ${PROJECT_NAME}`,
  flow: null,
  add: () => '',
  update: () => {},
}

export const FlowContext = React.createContext<FlowContextType>(DEFAULT_CONTEXT)

let GENERATOR_INDEX = 0

export const getHumanReadableName = (type: string): string => {
  ++GENERATOR_INDEX

  switch (type) {
    case 'metricSelector':
      return `Metric Selector ${GENERATOR_INDEX}`
    case 'visualization':
      return `Visualization ${GENERATOR_INDEX}`
    case 'markdown':
      return `Markdown ${GENERATOR_INDEX}`
    case 'rawFluxEditor':
      return `Flux Script ${GENERATOR_INDEX}`
    case 'toBucket':
      return `Output to Bucket ${GENERATOR_INDEX}`
    default:
      return `Cell ${GENERATOR_INDEX}`
  }
}

export const FlowProvider: FC = ({children}) => {
  const {flows, update, currentID} = useContext(FlowListContext)

  const updateCurrent = useCallback(
    (flow: Flow) => {
      update(currentID, {
        ...flows[currentID],
        ...flow,
      })
    },
    [currentID]
  )

  const addPipe = (initial: PipeData, index?: number) => {
    const id = `local_${UUID()}`

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
