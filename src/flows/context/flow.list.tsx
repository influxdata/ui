import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {createLocalStorageStateHook} from 'use-local-storage-state'
import {v4 as UUID} from 'uuid'
import {
  FlowList,
  Flow,
  FlowState,
  Resource,
  PipeData,
  PipeMeta,
} from 'src/types/flows'
import {getOrg} from 'src/organizations/selectors'
import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {AUTOREFRESH_DEFAULT} from 'src/shared/constants'
import {DEFAULT_PROJECT_NAME, PROJECT_NAME} from 'src/flows'
import {TEMPLATES} from 'src/flows/templates'
import {
  pooledUpdateAPI,
  createAPI,
  deleteAPI,
  getAllAPI,
  migrateLocalFlowsToAPI,
} from 'src/flows/context/api'
import {notify} from 'src/shared/actions/notifications'
import {
  notebookCreateFail,
  notebookDeleteFail,
} from 'src/shared/copy/notifications'
import {incrementCloneName} from 'src/utils/naming'

export interface FlowListContextType extends FlowList {
  add: (flow?: Flow) => Promise<string>
  clone: (id: string) => void
  update: (id: string, flow: Partial<Flow>) => void
  remove: (id: string) => void
  currentID: string | null
  change: (id: string) => void
  getAll: () => void
}

export const EMPTY_NOTEBOOK: FlowState = {
  name: DEFAULT_PROJECT_NAME,
  range: DEFAULT_TIME_RANGE,
  refresh: AUTOREFRESH_DEFAULT,
  data: {
    byID: {},
    allIDs: [],
  } as Resource<PipeData>,
  meta: {
    byID: {},
    allIDs: [],
  } as Resource<PipeMeta>,
  readOnly: false,
}

export const DEFAULT_CONTEXT: FlowListContextType = {
  flows: {},
  add: (_flow?: Flow) => {},
  clone: (_id: string) => {},
  update: (_id: string, _flow: Partial<Flow>) => {},
  remove: (_id: string) => {},
  change: (_id: string) => {},
  getAll: () => {},
  currentID: null,
} as FlowListContextType

const useLocalStorageState = createLocalStorageStateHook(
  'flows',
  DEFAULT_CONTEXT.flows
)

export const FlowListContext = React.createContext<FlowListContextType>(
  DEFAULT_CONTEXT
)

export function serialize(flow: Flow, orgID: string) {
  const apiFlow = {
    data: {
      orgID,
      name: flow.name,
      spec: {
        name: flow.name,
        readOnly: flow.readOnly,
        range: flow.range,
        refresh: flow.refresh,
        createdAt: flow.createdAt,
        updatedAt: flow.updatedAt,
        pipes: flow.data.allIDs.map(id => {
          const meta = flow.meta.byID[id]
          // if data changes first, meta will not exist yet
          if (meta) {
            return {
              ...flow.data.byID[id],
              id,
              title: meta.title,
              visible: meta.visible,
            }
          }
          return {}
        }),
      },
    },
  }

  return apiFlow
}

export function hydrate(data) {
  const flow = {
    ...JSON.parse(JSON.stringify(EMPTY_NOTEBOOK)),
    name: data.name || EMPTY_NOTEBOOK.name,
    range: data.spec.range,
    refresh: data.spec.refresh,
    readOnly: data.spec.readOnly,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    createdBy: data.createdBy,
  }
  if (data.id) {
    flow.id = data.id
  }

  if (!data?.spec?.pipes) {
    return flow
  }
  data.spec.pipes.forEach(pipe => {
    const id = pipe.id || `local_${UUID()}`

    flow.data.allIDs.push(id)
    flow.meta.allIDs.push(id)

    const meta = {
      title: pipe.title,
      visible: pipe.visible,
    }

    delete pipe.title
    delete pipe.visible

    flow.data.byID[id] = pipe
    flow.meta.byID[id] = meta
  })

  return flow
}

export const FlowListProvider: FC = ({children}) => {
  const [flows, setFlows] = useLocalStorageState()
  const [currentID, setCurrentID] = useState(DEFAULT_CONTEXT.currentID)
  const org = useSelector(getOrg)

  const dispatch = useDispatch()
  useEffect(() => {
    migrate()
    getAll()
  }, [])

  const clone = async (id: string): Promise<string> => {
    if (!flows.hasOwnProperty(id)) {
      throw new Error(`${PROJECT_NAME} not found`)
    }

    const flow = flows[id]

    const allFlowNames = Object.values(flows).map(value => value.name)
    const clonedName = incrementCloneName(allFlowNames, flow.name)

    const data = {
      ...flow,
      name: clonedName,
    }

    return await add(data)
  }

  const add = async (flow?: Flow): Promise<string> => {
    let _flow

    if (!flow) {
      _flow = hydrate({
        ...TEMPLATES['default'].init(),
        name: DEFAULT_PROJECT_NAME,
      })
    } else {
      _flow = {
        name: flow.name,
        range: flow.range,
        refresh: flow.refresh,
        data: flow.data,
        meta: flow.meta,
        readOnly: flow.readOnly,
        createdAt: flow.createdAt,
        updatedAt: flow.updatedAt,
      }
    }

    const apiFlow = serialize(_flow, org.id)

    let id: string = `local_${UUID()}`
    try {
      const flow = await createAPI(apiFlow)
      id = flow.id

      _flow = hydrate(flow)
    } catch {
      dispatch(notify(notebookCreateFail()))
    }

    return new Promise(resolve => {
      setTimeout(() => {
        setFlows({
          ...flows,
          [id]: _flow,
        })

        setCurrentID(id)

        resolve(id)
      }, 200)
    })
  }

  const update = useCallback(
    (id: string, flow: Partial<Flow>) => {
      if (!flows.hasOwnProperty(id)) {
        throw new Error(`${PROJECT_NAME} not found`)
      }

      setFlows(prevFlows => ({
        ...prevFlows,
        [id]: {
          ...prevFlows[id],
          ...flow,
        },
      }))

      const apiFlow = serialize(
        {
          ...flows[id],
          ...flow,
        },
        org.id
      )

      pooledUpdateAPI({id, ...apiFlow})
    },
    [setFlows, org.id, flows] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const remove = async (id: string) => {
    const _flows = {
      ...flows,
    }
    try {
      await deleteAPI({id})
    } catch (error) {
      dispatch(notify(notebookDeleteFail()))
    }

    delete _flows[id]
    if (currentID === id) {
      setCurrentID(null)
    }

    setFlows(_flows)
  }

  const getAll = useCallback(async (): Promise<void> => {
    const data = await getAllAPI(org.id)
    if (data && data.flows) {
      const _flows = {}
      data.flows.forEach(f => {
        _flows[f.id] = hydrate(f)
      })
      setFlows(_flows)
    }
  }, [org.id, setFlows])

  const change = useCallback(
    (id: string) => {
      if (!Object.keys(flows).length) {
        getAll()
      }
      setCurrentID(id)
    },
    [setCurrentID, flows]
  )

  const migrate = async () => {
    const _flows = await migrateLocalFlowsToAPI(
      org.id,
      flows,
      serialize,
      dispatch
    )
    setFlows({..._flows})
    if (currentID && currentID.includes('local')) {
      // if we migrated the local currentID flow, reset currentID
      setCurrentID(Object.keys(_flows)[0])
    }
  }

  return (
    <FlowListContext.Provider
      value={{
        flows,
        add,
        clone,
        update,
        remove,
        getAll,
        currentID,
        change,
      }}
    >
      {children}
    </FlowListContext.Provider>
  )
}

export default FlowListProvider
