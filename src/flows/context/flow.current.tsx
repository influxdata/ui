import React, {FC, useContext, useCallback} from 'react'
import {Flow, PipeData} from 'src/types/flows'
import {FlowListContext, FlowListProvider} from 'src/flows/context/flow.list'
import {v4 as UUID} from 'uuid'
import {RemoteDataState} from 'src/types'
import {PROJECT_NAME, PIPE_DEFINITIONS} from 'src/flows'
import {event} from 'src/cloud/utils/reporting'

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

export const FlowProvider: FC = ({children}) => {
  const {flows, update, currentID} = useContext(FlowListContext)

  const updateCurrent = useCallback(
    (flow: Flow) => {
      update(currentID, {
        ...flows[currentID],
        ...flow,
      })
    },
    [currentID, flows[currentID]]
  )

  const addPipe = (initial: PipeData, index?: number) => {
    const id = `local_${UUID()}`

    flows[currentID].data.add(id, initial)
    flows[currentID].meta.add(id, {
      title: `${PIPE_DEFINITIONS[initial.type].button ||
        'Panel'} ${++GENERATOR_INDEX}`,
      visible: true,
      loading: RemoteDataState.NotStarted,
    })

    if (typeof index !== 'undefined') {
      flows[currentID].data.move(id, index + 1)
    }

    event('insert_notebook_cell', {notebooksCellType: initial.type})

    return id
  }

  if (!flows) {
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
}

const CurrentFlow: FC = ({children}) => {
  return (
    <FlowListProvider>
      <FlowProvider>{children}</FlowProvider>
    </FlowListProvider>
  )
}

export default CurrentFlow
