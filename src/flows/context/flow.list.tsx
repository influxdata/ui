import React, {FC, useCallback} from 'react'
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
  postApiV2privateFlowsOrgsFlow,
  PostApiV2privateFlowsOrgsFlowParams,
  patchApiV2privateFlowsOrgsFlow,
  PatchApiV2privateFlowsOrgsFlowParams,
  deleteApiV2privateFlowsOrgsFlow,
  getApiV2privateFlowsOrgsFlows,
} from 'src/client/flowsRoutes'

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

export function hydrate(flow) {
  const _flow = {
    ...JSON.parse(JSON.stringify(EMPTY_NOTEBOOK)),
    name: flow.name,
    range: flow.range,
    refresh: flow.refresh,
    readOnly: flow.readOnly,
  }
  if (flow.data) {
    Object.keys(flow.data.byID).forEach(key => {
      const pipe = flow.data.byID[key]
      const id = pipe.id || `local_${UUID()}`

      _flow.data.allIDs.push(id)
      _flow.meta.allIDs.push(id)

      const meta = {
        title: pipe.title,
        visible: pipe.visible,
        loading: RemoteDataState.NotStarted,
      }

      delete pipe.title
      delete pipe.visible

      _flow.data.byID[id] = pipe
      _flow.meta.byID[id] = meta
    })
  }
  return _flow
}

export const FlowListProvider: FC = ({children}) => {
  const [flows, setFlows] = useFlowListState(DEFAULT_CONTEXT.flows)
  const [currentID, setCurrentID] = useFlowCurrentState(null)
  const {orgID} = useParams<{orgID: string}>()

  const getAll = useCallback(async (): Promise<void> => {
    const res = await getApiV2privateFlowsOrgsFlows({orgID})
    if (res.status != 200) {
      throw new Error(res.data.message)
    }

    if (res.data.flows) {
      const _flows = {}
      res.data.flows.forEach(f => (_flows[f.id] = hydrate(f.spec)))
      setFlows(_flows)
    }
  }, [orgID, setFlows])

  const add = async (flow?: Flow): Promise<string> => {
    let _flow

    if (!flow) {
      _flow = {
        ...hydrate({
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
        }),
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
      orgID: orgID,
      data: {
        orgID: orgID,
        name: _flow.name,
        spec: _flow,
      },
    }
    const res = await postApiV2privateFlowsOrgsFlow(apiFlow)

    if (res.status != 200) {
      throw new Error(res.data.message)
    }

    return new Promise(resolve => {
      setTimeout(() => {
        setFlows({
          ...flows,
          [res.data.id]: _flow,
        })

        setCurrentID(res.data.id)

        resolve(res.data.id)
      }, 200)
    })
  }

  const update = async (id: string, flow: Flow) => {
    if (!flows.hasOwnProperty(id)) {
      throw new Error(`${PROJECT_NAME} not found`)
    }

    const data = {
      name: flow.name,
      range: flow.range,
      refresh: flow.refresh,
      data: flow.data.serialize(),
      meta: flow.meta.serialize(),
      readOnly: flow.readOnly,
    }

    setFlows({
      ...flows,
      [id]: data,
    })
    const apiFlow: PatchApiV2privateFlowsOrgsFlowParams = {
      orgID: orgID,
      id,
      data: {
        orgID: orgID,
        id,
        name: {value: flow.name},
        spec: data,
      },
    }
    const res = await patchApiV2privateFlowsOrgsFlow(apiFlow)
    if (res.status != 200) {
      throw new Error(res.data.message)
    }
  }

  const change = useCallback(
    (id: string) => {
      if (!flows || !flows.hasOwnProperty(id)) {
        throw new Error(`${PROJECT_NAME} does note exist`)
      }

      setCurrentID(id)
    },
    [setCurrentID, flows]
  )

  const remove = async (id: string) => {
    const _flows = {
      ...flows,
    }
    const res = await deleteApiV2privateFlowsOrgsFlow({orgID, id})

    if (res.status != 200) {
      throw new Error(res.data.message)
    }

    delete _flows[id]
    if (currentID === id) {
      setCurrentID(null)
    }

    setFlows(_flows)
  }

  const flowList = Object.keys(flows).reduce((acc, curr) => {
    const stateUpdater = (field, data) => {
      const _flow = {
        ...flows[curr],
      }

      _flow[field] = data

      setFlows({
        ...flows,
        [curr]: _flow,
      })
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
