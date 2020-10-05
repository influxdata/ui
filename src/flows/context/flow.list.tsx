import React, {FC} from 'react'
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
import {default as _asResource} from 'src/flows/context/resource.hook'

const useFlowListState = createPersistedState('flows')

export interface FlowListContextType extends FlowList {
  add: (flow?: Flow) => string
  update: (id: string, flow: Flow) => void
  remove: (id: string) => void
}

export const EMPTY_NOTEBOOK: FlowState = {
  name: 'Name this Flow',
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
} as FlowListContextType

export const FlowListContext = React.createContext<FlowListContextType>(
  DEFAULT_CONTEXT
)

export const FlowListProvider: FC = ({children}) => {
  const [flows, setFlows] = useFlowListState(DEFAULT_CONTEXT.flows)

  const add = (flow?: Flow): string => {
    const id = UUID()
    let _flow

    if (!flow) {
      _flow = {
        ...EMPTY_NOTEBOOK,
      }
    } else {
      _flow = {
        name: flow.name,
        data: flow.data.serialize(),
        meta: flow.meta.serialize(),
        readOnly: flow.readOnly,
      }
    }

    setFlows({
      ...flows,
      [id]: _flow,
    })

    return id
  }

  const update = (id: string, flow: Flow) => {
    if (!flows.hasOwnProperty(id)) {
      throw new Error('Flow not found')
    }

    setFlows({
      ...flows,
      [id]: {
        name: flow.name,
        data: flow.data.serialize(),
        meta: flow.meta.serialize(),
        readOnly: flow.readOnly,
      },
    })
  }

  const remove = (id: string) => {
    const _flows = {
      ...flows,
    }

    delete _flows[id]

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
      }}
    >
      {children}
    </FlowListContext.Provider>
  )
}

export default FlowListProvider
