import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import useLocalStorageState from 'use-local-storage-state'
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
import {getMe} from 'src/me/selectors'
import {default as _asResource} from 'src/flows/context/resource.hook'
import {PIPE_DEFINITIONS} from 'src/flows'
import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {AUTOREFRESH_DEFAULT} from 'src/shared/constants'
import {PROJECT_NAME} from 'src/flows'
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
  update: (id: string, flow: Flow) => void
  remove: (id: string) => void
  currentID: string | null
  change: (id: string) => void
  getAll: () => void
}

export const EMPTY_NOTEBOOK: FlowState = {
  name: `Name this ${PROJECT_NAME}`,
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
  update: (_id: string, _flow: Flow) => {},
  remove: (_id: string) => {},
  change: (_id: string) => {},
  getAll: () => {},
  currentID: null,
} as FlowListContextType

export const FlowListContext = React.createContext<FlowListContextType>(
  DEFAULT_CONTEXT
)

export function serialize(flow) {
  const apiFlow = {
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
  }

  return apiFlow
}

export function hydrate(data) {
  const flow = {
    ...JSON.parse(JSON.stringify(EMPTY_NOTEBOOK)),
    name: data.name,
    range: data.spec.range,
    refresh: data.spec.refresh,
    readOnly: data.spec.readOnly,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
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
  const [flows, setFlows] = useLocalStorageState('flows', DEFAULT_CONTEXT.flows)
  const [currentID, setCurrentID] = useState(DEFAULT_CONTEXT.currentID)
  const org = useSelector(getOrg)
  const user = useSelector(getMe)
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
    let _flowData

    let {name} = user

    if (name.includes('@')) {
      name = name.split('@')[0]
    }
    name = `${name}-${PROJECT_NAME.toLowerCase()}-${new Date().toISOString()}`

    if (!flow) {
      _flowData = hydrate({
        name,
        spec: {
          readOnly: false,
          range: DEFAULT_TIME_RANGE,
          refresh: AUTOREFRESH_DEFAULT,
          pipes: [
            {
              title: 'Select a Metric',
              visible: true,
              type: 'metricSelector',
              ...JSON.parse(
                JSON.stringify(PIPE_DEFINITIONS['metricSelector'].initial)
              ),
            },
            {
              title: 'Validate the Data',
              visible: true,
              type: 'visualization',
              properties: {type: 'simple-table', showAll: false},
            },
            {
              title: 'Visualize the Result',
              visible: true,
              type: 'visualization',
              ...JSON.parse(
                JSON.stringify(PIPE_DEFINITIONS['visualization'].initial)
              ),
            },
          ],
        },
      })
      _flow = {
        ..._flowData,
      }
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

    const apiFlow = {
      orgID: org.id,
      data: {
        orgID: org.id,
        name: _flow.name,
        spec: serialize(_flow),
      },
    }
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

  const update = (id: string, flow: Flow) => {
    if (!flows.hasOwnProperty(id)) {
      throw new Error(`${PROJECT_NAME} not found`)
    }

    const data = {
      name: flow.name,
      range: flow.range,
      refresh: flow.refresh,
      data: flow.data,
      meta: flow.meta,
      readOnly: flow.readOnly,
      results: null,
      createdAt: flow.createdAt,
      updatedAt: flow.updatedAt,
    }

    setFlows({
      ...flows,
      [id]: data,
    })

    const apiFlow = {
      id,
      orgID: org.id,
      data: {
        id,
        orgID: org.id,
        name: flow.name,
        spec: serialize(data),
      },
    }
    pooledUpdateAPI(apiFlow)
  }

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

  const flowList = Object.keys(flows).reduce((acc, curr) => {
    const stateUpdater = (field, data) => {
      const _flow = {
        ...flows[curr],
      }

      _flow[field] = data

      update(curr, _flow)
    }

    acc[curr] = {
      createdAt: flows[curr].createdAt,
      updatedAt: flows[curr].updatedAt,
      name: flows[curr].name,
      range: flows[curr].range,
      refresh: flows[curr].refresh,
      data: _asResource(flows[curr].data, data => {
        stateUpdater('data', data)
      }),
      meta: _asResource(flows[curr].meta, data => {
        stateUpdater('meta', data)
      }),
      readOnly: flows[curr].readOnly,
    } as Flow

    return acc
  }, {})

  return (
    <FlowListContext.Provider
      value={{
        flows: flowList,
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
