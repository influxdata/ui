import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {createLocalStorageStateHook} from 'use-local-storage-state'
import {nanoid} from 'nanoid'
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
  createAPI,
  deleteAPI,
  getAllAPI,
  migrateLocalFlowsToAPI,
} from 'src/flows/context/api'
import {
  getNotebook,
  postNotebook,
  patchNotebook,
} from 'src/client/notebooksRoutes'
import {notify} from 'src/shared/actions/notifications'
import {
  notebookCreateFail,
  notebookDeleteFail,
  notebookDeleteSuccess,
} from 'src/shared/copy/notifications'
import {setCloneName} from 'src/utils/naming'
import {CLOUD} from 'src/shared/constants'
import {getErrorMessage} from 'src/utils/api'

export interface FlowListContextType extends FlowList {
  add: (flow?: Flow) => Promise<string | void>
  clone: (id: string) => Promise<string | void>
  update: (id: string, flow?: Flow) => void
  remove: (id: string) => void
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
  getAll: () => {},
} as FlowListContextType

const useLocalStorageState = createLocalStorageStateHook(
  'flows',
  DEFAULT_CONTEXT.flows
)

export const FlowListContext =
  React.createContext<FlowListContextType>(DEFAULT_CONTEXT)

export function serialize(flow: Flow) {
  const apiFlow: any = {
    data: {
      orgID: flow.orgID,
      name: flow.name,
      spec: {
        name: flow.name,
        readOnly: flow.readOnly,
        range: flow.range,
        refresh: flow.refresh,
        createdAt: flow.createdAt,
        createdBy: flow.createdBy,
        updatedAt: flow.updatedAt,
        pipes: flow.data.allIDs.map(id => {
          const meta = flow.meta.byID[id]
          // if data changes first, meta will not exist yet
          let out = {} as PipeMeta

          if (meta) {
            out = {
              ...flow.data.byID[id],
              id,
              title: meta.title,
              visible: meta.visible,
            }

            if (meta.layout) {
              out.layout = meta.layout
            }
          }

          return out
        }),
      },
    },
  }

  if (flow.id) {
    apiFlow.data.id = flow.id
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
    isDirty: data?.isDirty ?? true,
  }
  if (data.id) {
    flow.id = data.id
  }
  if (data.orgID) {
    flow.orgID = data.orgID
  }

  if (!data?.spec?.pipes) {
    return flow
  }
  data.spec.pipes.forEach(pipe => {
    const id = pipe.id || `local_${nanoid()}`

    flow.data.allIDs.push(id)
    flow.meta.allIDs.push(id)

    const meta = {
      title: pipe.title,
      visible: pipe.visible,
    } as PipeMeta

    if (pipe.layout) {
      meta.layout = pipe.layout
      delete pipe.layout
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
  const [currentID, setCurrentID] = useState(null)
  const org = useSelector(getOrg)

  const dispatch = useDispatch()
  useEffect(() => {
    migrate()
    getAll()
  }, [])

  const clone = async (id: string): Promise<string | void> => {
    if (!flows.hasOwnProperty(id)) {
      throw new Error(`${PROJECT_NAME} not found`)
    }

    try {
      const resp = await getNotebook({id})

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      const _flow = hydrate(resp.data)
      _flow.name = setCloneName(_flow.name)
      delete _flow.id

      const response = await postNotebook(serialize(_flow))

      if (response.status !== 200) {
        throw new Error(response.data.message)
      }

      return response.data.id
    } catch (error) {
      console.error({error})
    }
  }

  const add = (flow?: Flow): Promise<string | void> => {
    let _flow

    if (!flow) {
      _flow = hydrate({
        ...TEMPLATES['default'].init(),
        name: DEFAULT_PROJECT_NAME,
        orgID: org.id,
      })
    } else {
      _flow = {
        name: flow.name,
        orgID: flow.orgID,
        range: flow.range,
        refresh: flow.refresh,
        data: flow.data,
        meta: flow.meta,
        readOnly: flow.readOnly,
        createdAt: flow.createdAt,
        updatedAt: flow.updatedAt,
      }
    }

    return createAPI(serialize(_flow))
      .then(flow => {
        setFlows({
          ...flows,
          [flow.id]: hydrate(flow),
        })

        return flow.id
      })
      .catch(err => {
        dispatch(notify(notebookCreateFail(getErrorMessage(err))))
      })
  }

  const update = useCallback(
    async (id: string, flow: Partial<Flow>) => {
      try {
        if (!flows.hasOwnProperty(id)) {
          throw new Error(`${PROJECT_NAME} not found`)
        }

        if (CLOUD) {
          const resp = await patchNotebook({
            id: id,
            data: {
              name: flow.name,
              orgID: org.id,
            },
          })

          if (resp.status !== 200) {
            throw new Error(resp.data.message)
          }

          setFlows(prevFlows => ({
            ...prevFlows,
            [id]: {
              ...prevFlows[id],
              name: flow.name,
            },
          }))
        } else {
          const _flow = flows[id]

          const data = {
            ..._flow,
            name: setCloneName(_flow.name),
          }

          return await add(data)
        }
      } catch (error) {
        console.error({error})
      }
    },
    [setFlows, org.id, flows] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const remove = async (id: string) => {
    const _flows = {
      ...flows,
    }
    try {
      await deleteAPI({id})
      dispatch(notify(notebookDeleteSuccess()))
    } catch (error) {
      dispatch(notify(notebookDeleteFail(getErrorMessage(error))))
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
      if (CLOUD) {
        data.flows.forEach(flow => {
          _flows[flow.id] = {
            name: flow.name,
            createdAt: flow.createdAt,
            createdBy: flow.createdBy,
            updatedAt: flow.updatedAt,
          }
        })
      } else {
        data.flows.forEach(f => {
          _flows[f.id] = hydrate(f)
        })
      }
      setFlows(_flows)
    }
  }, [org.id, setFlows])

  const migrate = async () => {
    const localFlows = Object.keys(flows).filter(id => id.includes('local'))
    if (!localFlows.length) {
      return
    }

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
      }}
    >
      {children}
    </FlowListContext.Provider>
  )
}

export default FlowListProvider
