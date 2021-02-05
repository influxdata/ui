import React, {FC, useCallback, useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {useParams} from 'react-router-dom'
import createPersistedState from 'use-persisted-state'
import {v4 as UUID} from 'uuid'
import {
  FlowList,
  Flow,
  FlowState,
  Resource,
  PipeData,
  PipeMeta,
} from 'src/types/flows'
import {RemoteDataState} from 'src/types'
import {default as _asResource} from 'src/flows/context/resource.hook'
import {PIPE_DEFINITIONS} from 'src/flows'
import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {AUTOREFRESH_DEFAULT} from 'src/shared/constants'
import {PROJECT_NAME} from 'src/flows'
import {
  PostApiV2privateFlowsOrgsFlowParams,
  PatchApiV2privateFlowsOrgsFlowParams,
  DeleteApiV2privateFlowsOrgsFlowParams,
} from 'src/client/flowsRoutes'
import {
  pooledUpdateAPI,
  createAPI,
  deleteAPI,
  getAllAPI,
  migrateLocalFlowsToAPI,
  FLOWS_API_FLAG,
} from 'src/flows/context/api'
import {notify} from 'src/shared/actions/notifications'
import {
  notebookCreateFail,
  notebookDeleteFail,
} from 'src/shared/copy/notifications'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

const useFlowListState = createPersistedState('flows')
const useFlowCurrentState = createPersistedState('current-flow')

export interface FlowListContextType extends FlowList {
  add: (flow?: Flow) => Promise<string>
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
    pipes: flow.data.allIDs.map(id => {
      const meta = flow.meta.byID[id]
      // if data changes first, meta will not exist yet
      if (meta) {
        return {
          ...flow.data.byID[id],
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
    range: data.range,
    refresh: data.refresh,
    readOnly: data.readOnly,
  }
  if (!data.pipes) {
    return flow
  }
  data.pipes.forEach(pipe => {
    const id = pipe.id || `local_${UUID()}`

    flow.data.allIDs.push(id)
    flow.meta.allIDs.push(id)

    const meta = {
      title: pipe.title,
      visible: pipe.visible,
      loading: RemoteDataState.NotStarted,
    }

    delete pipe.title
    delete pipe.visible

    flow.data.byID[id] = pipe
    flow.meta.byID[id] = meta
  })

  return flow
}

export const FlowListProvider: FC = ({children}) => {
  const [flows, setFlows] = useFlowListState(DEFAULT_CONTEXT.flows)
  const [currentID, setCurrentID] = useFlowCurrentState(null)
  const {orgID} = useParams<{orgID: string}>()
  const dispatch = useDispatch()
  useEffect(() => {
    migrate()
  }, [])

  const add = async (flow?: Flow): Promise<string> => {
    let _flow
    let _flowData

    if (!flow) {
      if (isFlagEnabled('molly-first') && Object.keys(flows).length === 0) {
        _flowData = hydrate({
          name: `Name this ${PROJECT_NAME}`,
          readOnly: false,
          range: DEFAULT_TIME_RANGE,
          refresh: AUTOREFRESH_DEFAULT,
          pipes: [
            {
              title: 'Welcome',
              visible: true,
              type: 'youtube',
              uri: 'Rs16uhxK0h8',
            },
            {
              title: 'Select a Metric',
              visible: true,
              type: 'metricSelector',
              ...JSON.parse(
                JSON.stringify(PIPE_DEFINITIONS['metricSelector'].initial)
              ),
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
        })
      } else {
        _flowData = hydrate({
          name: `Name this ${PROJECT_NAME}`,
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
              title: 'Visualize the Result',
              visible: true,
              type: 'visualization',
              ...JSON.parse(
                JSON.stringify(PIPE_DEFINITIONS['visualization'].initial)
              ),
            },
          ],
        })
      }
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
      }
    }

    const apiFlow: PostApiV2privateFlowsOrgsFlowParams = {
      orgID,
      data: {
        orgID: orgID,
        name: _flow.name,
        spec: serialize(_flow),
      },
    }
    let id: string = `local_${UUID()}`
    try {
      id = await createAPI(apiFlow)
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
      data: flow.data.serialize ? flow.data.serialize() : flow.data,
      meta: flow.meta.serialize ? flow.meta.serialize() : flow.meta,
      readOnly: flow.readOnly,
    }

    setFlows({
      ...flows,
      [id]: data,
    })

    const apiFlow: PatchApiV2privateFlowsOrgsFlowParams = {
      id,
      orgID,
      data: {
        id,
        orgID,
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
      await deleteAPI({orgID, id} as DeleteApiV2privateFlowsOrgsFlowParams)
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
    const data = await getAllAPI(orgID)
    if (data.flows) {
      const _flows = {}
      data.flows.forEach(f => (_flows[f.id] = hydrate(f.spec)))
      setFlows(_flows)
    }
  }, [orgID, setFlows])

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
    if (isFlagEnabled(FLOWS_API_FLAG)) {
      const _flows = await migrateLocalFlowsToAPI(
        orgID,
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
