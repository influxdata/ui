import React, {FC, useCallback} from 'react'
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

const useFlowListState = createPersistedState('flows')
const useFlowCurrentState = createPersistedState('current-flow')

export interface FlowListContextType extends FlowList {
  add: (flow?: Flow) => Promise<string>
  update: (id: string, flow: Flow) => void
  remove: (id: string) => void
  currentID: string | null
  change: (id: string) => void
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
  currentID: null,
} as FlowListContextType

export const FlowListContext = React.createContext<FlowListContextType>(
  DEFAULT_CONTEXT
)

// NOTE: these have no utility, i'm just confused on how we are going to be getting
// data from the api as a contract hasn't come forward, so i'm trying to be pre-emptive
// on capabilities to speed integration. Remove the next two functions when that
// data contract gets some ground and shows up (alex)
export function serialize(flow) {
  const apiFlow = {
    name: flow.name,
    readOnly: flow.readOnly,
    range: flow.range,
    refresh: flow.refresh,
    pipes: flow.data.allIDs.map(id => {
      const meta = flow.meta.byID[id]

      return {
        ...flow.data.byID[id],
        title: meta.title,
        visible: meta.visible,
      }
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

  const add = (flow?: Flow): Promise<string> => {
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

    // console.log('add to the api', serialize(data))
    return new Promise(resolve => {
      setTimeout(() => {
        const id = `local_${UUID()}`

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
      data: flow.data.serialize(),
      meta: flow.meta.serialize(),
      readOnly: flow.readOnly,
    }

    setFlows({
      ...flows,
      [id]: data,
    })
    // console.log('update the api', serialize(data))
  }

  const change = useCallback(
    (id: string) => {
      if (!flows || !flows.hasOwnProperty(id)) {
        throw new Error(`${PROJECT_NAME} does note exist`)
      }

      setCurrentID(id)
    },
    [currentID, setCurrentID, flows]
  )

  const remove = (id: string) => {
    const _flows = {
      ...flows,
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
        currentID,
        change,
      }}
    >
      {children}
    </FlowListContext.Provider>
  )
}

export default FlowListProvider
