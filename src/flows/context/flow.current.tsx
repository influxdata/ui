import React, {
  FC,
  useContext,
  useCallback,
  useRef,
  useState,
  useEffect,
} from 'react'
import {Flow, PipeData, PipeMeta} from 'src/types/flows'
import {FlowListContext, FlowListProvider} from 'src/flows/context/flow.list'
import {v4 as UUID} from 'uuid'
import {DEFAULT_PROJECT_NAME, PIPE_DEFINITIONS} from 'src/flows'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import * as Y from 'yjs'
import {WebsocketProvider} from 'y-websocket'
import {serialize, hydrate} from 'src/flows/context/flow.list'

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

  const provider = useRef<WebsocketProvider>()
  const yDoc = useRef(new Y.Doc())
  function disconnectProvider() {
    if (provider.current) {
      provider.current.disconnect()
    }
  }

  // NOTE this is a pretty awful mechanism, as it duplicates the source of
  // truth for the definition of the current flow, but i can't see a good
  // way around it. We need to ensure that we're still updating the values
  // and references to the flows object directly to get around the async
  // update issues.

  useEffect(() => {
    if (currentID) {
      setCurrentFlow(flows[currentID])
    }
  }, [flows, currentID])

  const syncFunc = useCallback(
    (isSynced: boolean) => {
      if (!isSynced || !yDoc.current) {
        return
      }
      const {flowUpdateData} = yDoc.current.getMap('flowUpdateData')?.toJSON()
      if (!flowUpdateData && currentFlow) {
        yDoc.current
          .getMap('flowUpdateData')
          .set('flowUpdateData', serialize(currentFlow))
      }
    },
    [currentFlow]
  )

  const statusFunc = useCallback(({status}: {status: string}) => {
    if (status === 'connected') {
      // get the session from the cookie
      const {cookie} = document
      // send the session as an ArrayBuffer
      const buffer = Buffer.from(cookie)
      const messageType = Buffer.from([2])
      const uIntArray = new Uint8Array(
        buffer.byteLength + messageType.byteLength
      )
      uIntArray.set(new Uint8Array(messageType), 0)
      uIntArray.set(new Uint8Array(buffer), messageType.byteLength)
      provider.current.ws.send(uIntArray)
    }
  }, [])

  useEffect(() => {
    const doc = yDoc.current
    if (isFlagEnabled('sharedFlowEditing') && currentID) {
      provider.current = new WebsocketProvider(
        `wss://${window.location.host}/api/v2private/workbench`,
        currentID,
        doc
      )

      provider.current.on('sync', syncFunc)
      provider.current.on('status', statusFunc)
    }

    const onUpdate = () => {
      const {flowUpdateData} = doc.getMap('flowUpdateData').toJSON()
      const hydrated = hydrate(flowUpdateData?.data)

      setCurrentFlow(hydrated)
    }

    doc.on('update', onUpdate)
    return () => {
      if (isFlagEnabled('sharedFlowEditing')) {
        disconnectProvider()
      }
      doc.off('update', onUpdate)
    }
  }, [currentID])

  const updateData = useCallback(
    (id: string, data: Partial<PipeData>) => {
      if (isFlagEnabled('sharedFlowEditing')) {
        const flowCopy = JSON.parse(JSON.stringify(currentFlow))
        if (flowCopy?.data?.byID[id]) {
          flowCopy.data.byID[id] = {
            ...(flowCopy.data.byID[id] || {}),
            ...data,
          }
          yDoc.current
            .getMap('flowUpdateData')
            .set('flowUpdateData', serialize(flowCopy))
        }
        return
      }
      if (isFlagEnabled('ephemeralNotebook') && !currentFlow.id) {
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
      if (isFlagEnabled('sharedFlowEditing')) {
        if (currentFlow?.meta?.byID[id]) {
          const flowCopy = JSON.parse(JSON.stringify(currentFlow))
          flowCopy.meta.byID[id] = {
            title: '',
            visible: true,
            ...(flowCopy.meta.byID[id] || {}),
            ...meta,
          }

          yDoc.current
            .getMap('flowUpdateData')
            .set('flowUpdateData', serialize(flowCopy))
        }
        return
      }
      if (isFlagEnabled('ephemeralNotebook') && !currentFlow.id) {
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
      if (isFlagEnabled('sharedFlowEditing')) {
        if (currentFlow) {
          const flowCopy = JSON.parse(JSON.stringify(currentFlow))
          for (const ni in flow) {
            flowCopy[ni] = flow[ni]
          }
          yDoc.current
            .getMap('flowUpdateData')
            .set('flowUpdateData', serialize(flowCopy))
        }
        return
      }
      if (isFlagEnabled('ephemeralNotebook') && !currentFlow.id) {
        for (const ni in flow) {
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

    if (isFlagEnabled('sharedFlowEditing')) {
      const flowCopy = JSON.parse(JSON.stringify(currentFlow))
      flowCopy.data.byID[id] = initial
      flowCopy.meta.byID[id] = {
        title,
        visible: true,
      }
      if (typeof index !== 'undefined') {
        flowCopy.data.allIDs.splice(index + 1, 0, id)
        flowCopy.meta.allIDs.splice(index + 1, 0, id)
      } else {
        flowCopy.data.allIDs.push(id)
        flowCopy.meta.allIDs.push(id)
      }
      yDoc.current
        .getMap('flowUpdateData')
        .set('flowUpdateData', serialize(flowCopy))
      return
    }
    if (isFlagEnabled('ephemeralNotebook') && !currentFlow.id) {
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
    if (isFlagEnabled('sharedFlowEditing')) {
      const flowCopy = JSON.parse(JSON.stringify(currentFlow))

      flowCopy.meta.allIDs = flowCopy.meta.allIDs.filter(_id => _id !== id)
      flowCopy.data.allIDs = flowCopy.data.allIDs.filter(_id => _id !== id)

      delete flowCopy.data.byID[id]
      delete flowCopy.meta.byID[id]
      yDoc.current
        .getMap('flowUpdateData')
        .set('flowUpdateData', serialize(flowCopy))
      return
    }
    if (isFlagEnabled('ephemeralNotebook') && !currentFlow.id) {
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
