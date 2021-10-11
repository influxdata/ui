import React, {
  FC,
  useContext,
  useCallback,
  useRef,
  useState,
  useEffect,
} from 'react'
import {Flow, PipeData, PipeMeta} from 'src/types/flows'
import {v4} from 'uuid'
import {FlowListContext, FlowListProvider} from 'src/flows/context/flow.list'
import {v4 as UUID} from 'uuid'
import {DEFAULT_PROJECT_NAME, PIPE_DEFINITIONS} from 'src/flows'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import * as Y from 'yjs'
import {WebrtcProvider} from 'y-webrtc'
import {WebsocketProvider} from 'y-websocket'
import {IndexeddbPersistence} from 'y-indexeddb'

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

// const ydoc = new Y.Doc()

// // this allows you to instantly get the (cached) documents data
// const indexeddbProvider = new IndexeddbPersistence('count-demo', ydoc)
// indexeddbProvider.whenSynced.then(() => {
//   console.log('loaded data from indexed db')
// })

// // Sync clients with the y-webrtc provider.
// const webrtcProvider = new WebrtcProvider('count-demo', ydoc)

// // Sync clients with the y-websocket provider
// const websocketProvider = new WebsocketProvider(
//   'wss://demos.yjs.dev',
//   'count-demo',
//   ydoc
// )

// const uuid = v4()

export const FlowProvider: FC = ({children}) => {
  const {flows, update, currentID} = useContext(FlowListContext)
  const [currentFlow, setCurrentFlow] = useState<Flow>()

  // create a yDoc here
  const yDoc = useRef(new Y.Doc())
  const provider = useRef<WebrtcProvider>()

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

  useEffect(() => {
    if (isFlagEnabled('copresence')) {
      provider.current = new WebrtcProvider('current-flow', yDoc.current)
      const localState = provider.current.awareness.getLocalState()
      if (!localState) {
        provider.current.awareness.setLocalStateField(
          'experiment',
          DEFAULT_CONTEXT
        )
      }
      provider.current.awareness.on('change', () => {
        console.log('this is happening')
        const state = provider.current.awareness.getLocalState()
        setCurrentFlow(state['experiment'])
      })
    }
  }, [])

  const updateData = useCallback(
    (id: string, data: Partial<PipeData>) => {
      if (isFlagEnabled('copresence')) {
        provider.current.awareness.setLocalStateField('experiment', {
          ...(currentFlow.data.byID[id] || {}),
          ...data,
        })
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
      if (isFlagEnabled('copresence')) {
        provider.current.awareness.setLocalStateField('experiment', {
          title: '',
          visible: true,
          ...(currentFlow.meta.byID[id] || {}),
          ...meta,
        })
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
      if (isFlagEnabled('copresence')) {
        for (const ni in flow) {
          currentFlow[ni] = flow[ni]
        }
        provider.current.awareness.setLocalStateField('experiment', {
          ...currentFlow,
        })

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
