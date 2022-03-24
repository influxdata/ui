import React, {FC, useCallback, useRef, useState, useEffect} from 'react'
import {Flow, PipeData, PipeMeta} from 'src/types/flows'
import {customAlphabet} from 'nanoid'
import {PIPE_DEFINITIONS, PROJECT_NAME_PLURAL} from 'src/flows'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {Doc} from 'yjs'
import {WebsocketProvider} from 'y-websocket'
import {serialize, hydrate} from 'src/flows/context/flow.list'
import {useParams} from 'react-router-dom'
import {getNotebook} from 'src/client/notebooksRoutes'
import {event} from 'src/cloud/utils/reporting'
import {incrementCloneName} from 'src/utils/naming'
import {deleteNotebook, postNotebook} from 'src/client/notebooksRoutes'
import {getAllAPI, pooledUpdateAPI} from 'src/flows/context/api'
import {useDispatch} from 'react-redux'
import {notify} from 'src/shared/actions/notifications'
import {
  notebookDeleteFail,
  notebookDeleteSuccess,
} from 'src/shared/copy/notifications'
import {
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

const prettyid = customAlphabet('abcdefghijklmnop0123456789', 12)

export interface FlowContextType {
  flow: Flow | null
  add: (data: Partial<PipeData>, index?: number) => string
  cloneNotebook: () => void
  deleteNotebook: () => void
  updateData: (id: string, data: Partial<PipeMeta>) => void
  updateMeta: (id: string, meta: Partial<PipeMeta>) => void
  updateOther: (flow: Partial<Flow>) => void
  remove: (id: string) => void
  populate: (data: Flow) => void
}

export const DEFAULT_CONTEXT: FlowContextType = {
  flow: null,
  add: _ => '',
  cloneNotebook: () => {},
  deleteNotebook: () => {},
  updateData: (_, __) => {},
  updateMeta: (_, __) => {},
  updateOther: _ => {},
  remove: _ => {},
  populate: _ => null,
}

export const FlowContext = React.createContext<FlowContextType>(DEFAULT_CONTEXT)

let GENERATOR_INDEX = 0

export const FlowProvider: FC = ({children}) => {
  const dispatch = useDispatch()
  const {id, orgID} = useParams<{id: string; orgID: string}>()
  const [currentFlow, setCurrentFlow] = useState<Flow>()
  const provider = useRef<WebsocketProvider>()
  const yDoc = useRef(new Doc())
  function disconnectProvider() {
    if (provider.current) {
      provider.current.disconnect()
    }
  }

  const handleDeleteNotebook = useCallback(async () => {
    event('delete_notebook')
    try {
      const response = await deleteNotebook({id})

      if (response.status !== 204) {
        throw new Error(response.data.message)
      }
      dispatch(notify(notebookDeleteSuccess()))
    } catch (error) {
      dispatch(notify(notebookDeleteFail()))
    }
  }, [dispatch, id])

  const handleCloneNotebook = useCallback(async () => {
    try {
      const {flows} = await getAllAPI(orgID)

      const allFlowNames = Object.values(flows).map(value => value.name)
      const clonedName = incrementCloneName(allFlowNames, currentFlow.name)

      const _flow = serialize({...currentFlow, name: clonedName})
      delete _flow.data.id

      const response = await postNotebook(_flow)

      if (response.status !== 200) {
        throw new Error(response.data.message)
      }

      return response.data.id
    } catch (error) {
      console.error({error})
    }
  }, [currentFlow, orgID])

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
      event('Notebook Accessed', {notebookID: id})
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

  const update = useCallback(
    (flow: Flow) => {
      setCurrentFlow(flow)

      const apiFlow = serialize({
        ...flow,
      })

      pooledUpdateAPI({id, ...apiFlow})
    },
    [id]
  )

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
      update(flowCopy)
    },
    [currentFlow, update]
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
      update(flowCopy)
    },
    [currentFlow, update]
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

      update(_flow)
    },
    [currentFlow, update]
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

    update(flowCopy)

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

    update(flowCopy)
  }

  if (!currentFlow) {
    return (
      <SpinnerContainer
        loading={RemoteDataState.Loading}
        spinnerComponent={<TechnoSpinner />}
      />
    )
  }

  document.title = pageTitleSuffixer([currentFlow?.name, PROJECT_NAME_PLURAL])

  return (
    <FlowContext.Provider
      value={{
        flow: currentFlow,
        add: addPipe,
        cloneNotebook: handleCloneNotebook,
        deleteNotebook: handleDeleteNotebook,
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
  return <FlowProvider>{children}</FlowProvider>
}

export default CurrentFlow
