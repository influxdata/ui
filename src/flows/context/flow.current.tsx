import React, {FC, useContext, useCallback, useState, useEffect} from 'react'
import {Flow, PipeData, PipeMeta} from 'src/types/flows'
import {FlowListContext, FlowListProvider} from 'src/flows/context/flow.list'
import {v4 as UUID} from 'uuid'
import {DEFAULT_PROJECT_NAME, PIPE_DEFINITIONS} from 'src/flows'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

export interface FlowContextType {
  name: string
  flow: Flow | null
  add: (data: Partial<PipeData>, index?: number) => string
  updateData: (id: string, data: Partial<PipeMeta>) => void
  updateMeta: (id: string, meta: Partial<PipeMeta>) => void
  updateOther: (flow: Partial<Flow>) => void
  remove: (id: string) => void
  populate: (data: Flow) => void
}

export const DEFAULT_CONTEXT: FlowContextType = {
  name: DEFAULT_PROJECT_NAME,
  flow: null,
  add: _ => '',
  updateData: (_, __) => {},
  updateMeta: (_, __) => {},
  updateOther: _ => {},
  remove: _ => {},
  populate: _ => null,
}

export const FlowContext = React.createContext<FlowContextType>(DEFAULT_CONTEXT)

let GENERATOR_INDEX = 0

export const FlowProvider: FC = ({children}) => {
  const {flows, update, currentID} = useContext(FlowListContext)
  const [currentFlow, setCurrentFlow] = useState<Flow>()

  // NOTE this is a pretty aweful mecahnism, as it duplicates the source of
  // thruth for the definition of the current flow, but i can't see a good
  // way around it. We need to ensure that we're still updating the values
  // and references to the flows object directly to get around the async
  // update issues.
  useEffect(() => {
    if (currentID) {
      setCurrentFlow(flows[currentID])
    }
  }, [currentID])

  const updateData = useCallback(
    (id: string, data: Partial<PipeData>) => {
      if (isFlagEnabled('ephemeral') && !currentFlow.id) {
        currentFlow.data.byID[id] = {
          ...(currentFlow.data.byID[id] || {}),
          ...data,
        }
        setCurrentFlow({...currentFlow})
        return
      }

      flows[currentID].data.byID[id] = {
        ...(flows[currentID].data.byID[id] || {}),
        ...data,
      }

      // this should update the useEffect on the next time around
      update(currentID, {
        data: {
          ...flows[currentID].data,
        },
      })
    },
    [update, flows, currentID, currentFlow]
  )

  const updateMeta = useCallback(
    (id: string, meta: Partial<PipeMeta>) => {
      if (isFlagEnabled('ephemeral') && !currentFlow.id) {
        currentFlow.meta.byID[id] = {
          title: '',
          visible: true,
          ...(currentFlow.meta.byID[id] || {}),
          ...meta,
        }
        setCurrentFlow({...currentFlow})
        return
      }

      flows[currentID].meta.byID[id] = {
        title: '',
        visible: true,
        ...(flows[currentID].meta.byID[id] || {}),
        ...meta,
      }

      // this should update the useEffect on the next time around
      update(currentID, {
        meta: {
          ...flows[currentID].meta,
        },
      })
    },
    [update, flows, currentID, currentFlow]
  )

  const updateOther = useCallback(
    (flow: Partial<Flow>) => {
      if (isFlagEnabled('ephemeral') && !currentFlow.id) {
        for (let ni in flow) {
          currentFlow[ni] = flow[ni]
        }

        setCurrentFlow({...currentFlow})
        return
      }

      flows[currentID] = {
        ...flows[currentID],
        ...flow,
      }

      update(currentID, {
        ...flows[currentID],
      })
    },
    [update, flows, currentID, currentFlow]
  )

  const addPipe = (initial: PipeData, index?: number) => {
    const id = `local_${UUID()}`
    const title =
      initial.title ||
      `${PIPE_DEFINITIONS[initial.type].button || 'Panel'} ${++GENERATOR_INDEX}`

    delete initial.title
    initial.id = id

    if (isFlagEnabled('ephemeral') && !currentFlow.id) {
      currentFlow.data.byID[id] = initial
      currentFlow.meta.byID[id] = {
        title,
        visible: true,
      }
      if (typeof index !== 'undefined') {
        currentFlow.data.allIDs.splice(index + 1, 0, id)
        currentFlow.meta.allIDs.splice(index + 1, 0, id)
      } else {
        currentFlow.data.allIDs.push(id)
        currentFlow.meta.allIDs.push(id)
      }
      setCurrentFlow({...currentFlow})
      return
    }

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
    if (isFlagEnabled('ephemeral') && !currentFlow.id) {
      currentFlow.meta.allIDs = currentFlow.meta.allIDs.filter(
        _id => _id !== id
      )
      currentFlow.data.allIDs = currentFlow.data.allIDs.filter(
        _id => _id !== id
      )

      delete currentFlow.data.byID[id]
      delete currentFlow.meta.byID[id]
      setCurrentFlow({...currentFlow})
      return
    }

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

  return (
    <FlowContext.Provider
      value={{
        name,
        flow: currentFlow,
        add: addPipe,
        updateData,
        updateMeta,
        updateOther,
        remove: removePipe,
        populate: setCurrentFlow,
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
