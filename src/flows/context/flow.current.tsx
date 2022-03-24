import React, {FC, useCallback, useRef, useState, useEffect} from 'react'
import {Flow, PipeData, PipeMeta} from 'src/types/flows'
import {FlowListProvider} from 'src/flows/context/flow.list'
import {customAlphabet} from 'nanoid'
import {DEFAULT_PROJECT_NAME, PIPE_DEFINITIONS} from 'src/flows'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {Doc} from 'yjs'
import {WebsocketProvider} from 'y-websocket'
import {serialize, hydrate} from 'src/flows/context/flow.list'
import {useParams} from 'react-router-dom'
import {getNotebook} from 'src/client/notebooksRoutes'

const prettyid = customAlphabet('abcdefghijklmnop0123456789', 12)

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
  const {id} = useParams<{id: string}>()
  const [currentFlow, setCurrentFlow] = useState<Flow>()
  const provider = useRef<WebsocketProvider>()
  const yDoc = useRef(new Doc())
  function disconnectProvider() {
    if (provider.current) {
      provider.current.disconnect()
    }
  }

  const handleGetNotebook = useCallback(async notebookId => {
    try {
      const response = await getNotebook({id: notebookId})

      if (response.status !== 200) {
        throw new Error(response.data.message)
      }

      setCurrentFlow(hydrate(response.data))
    } catch (error) {
      console.error({error})
    }
  }, [])

  useEffect(() => {
    if (id) {
      handleGetNotebook(id)
    }
  }, [handleGetNotebook, id])

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

  useEffect(() => {
    const doc = yDoc.current
    if (isFlagEnabled('sharedFlowEditing') && id) {
      provider.current = new WebsocketProvider(
        `wss://${window.location.host}/api/workbench`,
        id,
        doc
      )

      provider.current.on('sync', syncFunc)
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
  }, [id])

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
      if (
        !isFlagEnabled('flowPublishLifecycle') &&
        isFlagEnabled('ephemeralNotebook') &&
        !currentFlow.id
      ) {
        currentFlow.data.byID[id] = {
          ...(currentFlow.data.byID[id] || {}),
          ...data,
        }
        setCurrentFlow({...currentFlow})
        return
      }

      const flowCopy = JSON.parse(JSON.stringify(currentFlow))

      flowCopy.data.byID[id] = {
        ...(currentFlow.data.byID[id] || {}),
        ...data,
      }

      // this should update the useEffect on the next time around
      setCurrentFlow(flowCopy)
    },
    [currentFlow]
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
      if (
        !isFlagEnabled('flowPublishLifecycle') &&
        isFlagEnabled('ephemeralNotebook') &&
        !currentFlow.id
      ) {
        currentFlow.meta.byID[id] = {
          title: '',
          visible: true,
          ...(currentFlow.meta.byID[id] || {}),
          ...meta,
        }
        setCurrentFlow({...currentFlow})
        return
      }

      const flowCopy = JSON.parse(JSON.stringify(currentFlow))

      flowCopy.meta.byID[id] = {
        title: '',
        visible: true,
        ...(currentFlow.meta.byID[id] || {}),
        ...meta,
      }

      // this should update the useEffect on the next time around
      setCurrentFlow(flowCopy)
    },
    [currentFlow]
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
      if (
        !isFlagEnabled('flowPublishLifecycle') &&
        isFlagEnabled('ephemeralNotebook') &&
        !currentFlow.id
      ) {
        for (const ni in flow) {
          currentFlow[ni] = flow[ni]
        }

        setCurrentFlow({...currentFlow})
        return
      }

      const _flow = {
        ...currentFlow,
        ...flow,
      }

      setCurrentFlow(_flow)
    },
    [id, currentFlow]
  )

  const addPipe = (initial: PipeData, index?: number) => {
    const id = prettyid()
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
    if (
      !isFlagEnabled('flowPublishLifecycle') &&
      isFlagEnabled('ephemeralNotebook') &&
      !currentFlow.id
    ) {
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

    updateData(id, {})
    updateMeta(id, {})

    return id
  }

  const removePipe = (id: string) => {
    const definition = PIPE_DEFINITIONS[currentFlow.data.byID[id].type]
    if (definition?.beforeRemove) {
      definition.beforeRemove(currentFlow.data.byID[id])
    }

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
    if (
      !isFlagEnabled('flowPublishLifecycle') &&
      isFlagEnabled('ephemeralNotebook') &&
      !currentFlow.id
    ) {
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

    const flowCopy = JSON.parse(JSON.stringify(currentFlow))

    flowCopy.meta.allIDs = flowCopy.meta.allIDs.filter(_id => _id !== id)
    flowCopy.data.allIDs = flowCopy.data.allIDs.filter(_id => _id !== id)

    delete flowCopy.data.byID[id]
    delete flowCopy.meta.byID[id]

    updateData(id, {})
    updateMeta(id, {})
  }

  if (!currentFlow) {
    return null
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
