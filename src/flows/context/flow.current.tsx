import React, {FC, useContext, useCallback} from 'react'
import {Flow, PipeData, PipeMeta} from 'src/types/flows'
import {FlowListContext, FlowListProvider} from 'src/flows/context/flow.list'
import {v4 as UUID} from 'uuid'
import {DEFAULT_PROJECT_NAME, PIPE_DEFINITIONS} from 'src/flows'

export interface FlowContextType {
  id: string | null
  name: string
  flow: Flow | null
  add: (data: Partial<PipeData>, index?: number) => string
  updateData: (id: string, data: Partial<PipeMeta>) => void
  updateMeta: (id: string, meta: Partial<PipeMeta>) => void
  updateOther: (flow: Partial<Flow>) => void
  remove: (id: string) => void
}

export const DEFAULT_CONTEXT: FlowContextType = {
  id: null,
  name: DEFAULT_PROJECT_NAME,
  flow: null,
  add: _ => '',
  updateData: (_, __) => {},
  updateMeta: (_, __) => {},
  updateOther: _ => {},
  remove: _ => {},
}

export const FlowContext = React.createContext<FlowContextType>(DEFAULT_CONTEXT)

let GENERATOR_INDEX = 0

export const FlowProvider: FC = ({children}) => {
  const {flows, update, currentID} = useContext(FlowListContext)

  const updateData = useCallback(
    (id: string, data: Partial<PipeData>) => {
      flows[currentID].data.byID[id] = {
        ...(flows[currentID].data.byID[id] || {}),
        ...data,
      }

      update(currentID, {
        data: {
          ...flows[currentID].data,
        },
      })
    },
    [update, flows, currentID]
  )

  const updateMeta = useCallback(
    (id: string, meta: Partial<PipeMeta>) => {
      flows[currentID].meta.byID[id] = {
        title: '',
        visible: true,
        ...(flows[currentID].meta.byID[id] || {}),
        ...meta,
      }

      update(currentID, {
        meta: {
          ...flows[currentID].meta,
        },
      })
    },
    [update, flows, currentID]
  )

  const updateOther = useCallback(
    (flow: Partial<Flow>) => {
      flows[currentID] = {
        ...flows[currentID],
        ...flow,
      }

      update(currentID, {
        ...flows[currentID],
      })
    },
    [update, flows, currentID]
  )

  const addPipe = (initial: PipeData, index?: number) => {
    const id = `local_${UUID()}`
    const title =
      initial.title ||
      `${PIPE_DEFINITIONS[initial.type].button || 'Panel'} ${++GENERATOR_INDEX}`

    delete initial.title
    initial.id = id

    flows[currentID].data.byID[id] = initial
    flows[currentID].meta.byID[id] = {
      title,
      visible: true,
    }

    if (typeof index !== 'undefined') {
      flows[currentID].data.allIDs.splice(index + 1, 0, id)
      flows[currentID].meta.allIDs.splice(index + 1, 0, id)
    } else {
      flows[currentID].data.allIDs.push(id)
      flows[currentID].meta.allIDs.push(id)
    }

    updateData(id, {})
    updateMeta(id, {})

    return id
  }

  const removePipe = (id: string) => {
    flows[currentID].meta.allIDs = flows[currentID].meta.allIDs.filter(
      _id => _id !== id
    )
    flows[currentID].data.allIDs = flows[currentID].data.allIDs.filter(
      _id => _id !== id
    )

    delete flows[currentID].data.byID[id]
    delete flows[currentID].meta.byID[id]

    updateData(id, {})
    updateMeta(id, {})
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
        updateData,
        updateMeta,
        updateOther,
        remove: removePipe,
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
