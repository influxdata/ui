import React, {FC, useCallback} from 'react'
import {useParams} from 'react-router-dom'
import createPersistedState from 'use-persisted-state'
import {default as _asResource} from 'src/flows/context/resource.hook'
import {getAllAPI} from 'src/functions/context/api'
import {Function} from 'src/client/managedFunctionsRoutes'

const useFlowListState = createPersistedState('flows')

export interface FunctionList {
  functionsList: {
    [key: string]: Function
  }
}

export interface FunctionListContextType extends FunctionList {
  // add: (_function?: FunctionCreateRequest) => Promise<string>
  // remove: (_id: string) => void
  getAll: () => void
}

export const DEFAULT_CONTEXT: FunctionListContextType = {
  functionsList: {},
  // add: (_function?: FunctionCreateRequest) => {},
  // remove: (_id: string) => {},
  getAll: () => {},
} as FunctionListContextType

export const FunctionListContext = React.createContext<FunctionListContextType>(
  DEFAULT_CONTEXT
)

export const FunctionListProvider: FC = ({children}) => {
  const [functionsList, setFunctionsList] = useFlowListState(
    DEFAULT_CONTEXT.functionsList
  )
  const {orgID} = useParams<{orgID: string}>()

  const getAll = useCallback(async (): Promise<void> => {
    const data = await getAllAPI(orgID)
    if (data.functions) {
      const _functions = {}
      data.functions.forEach(f => (_functions[f.id] = f))
      setFunctionsList(_functions)
    }
  }, [orgID, setFunctionsList])

  // const add = async (flow?: Flow): Promise<string> => {
  //   let _flow
  //   let _flowData

  //   if (!flow) {
  //     if (isFlagEnabled('molly-first') && Object.keys(functions).length === 0) {
  //       _flowData = hydrate({
  //         name: `Name this ${PROJECT_NAME}`,
  //         readOnly: false,
  //         range: DEFAULT_TIME_RANGE,
  //         refresh: AUTOREFRESH_DEFAULT,
  //         pipes: [
  //           {
  //             title: 'Welcome',
  //             visible: true,
  //             type: 'youtube',
  //             uri: 'Rs16uhxK0h8',
  //           },
  //           {
  //             title: 'Select a Metric',
  //             visible: true,
  //             type: 'metricSelector',
  //             ...JSON.parse(
  //               JSON.stringify(PIPE_DEFINITIONS['metricSelector'].initial)
  //             ),
  //           },
  //           {
  //             title: 'Visualize the Result',
  //             visible: true,
  //             type: 'visualization',
  //             ...JSON.parse(
  //               JSON.stringify(PIPE_DEFINITIONS['visualization'].initial)
  //             ),
  //           },
  //         ],
  //       })
  //     } else {
  //       _flowData = hydrate({
  //         name: `Name this ${PROJECT_NAME}`,
  //         readOnly: false,
  //         range: DEFAULT_TIME_RANGE,
  //         refresh: AUTOREFRESH_DEFAULT,
  //         pipes: [
  //           {
  //             title: 'Select a Metric',
  //             visible: true,
  //             type: 'metricSelector',
  //             ...JSON.parse(
  //               JSON.stringify(PIPE_DEFINITIONS['metricSelector'].initial)
  //             ),
  //           },
  //           {
  //             title: 'Visualize the Result',
  //             visible: true,
  //             type: 'visualization',
  //             ...JSON.parse(
  //               JSON.stringify(PIPE_DEFINITIONS['visualization'].initial)
  //             ),
  //           },
  //         ],
  //       })
  //     }
  //     _flow = {
  //       ..._flowData,
  //     }
  //   } else {
  //     _flow = {
  //       name: flow.name,
  //       range: flow.range,
  //       refresh: flow.refresh,
  //       data: flow.data,
  //       meta: flow.meta,
  //       readOnly: flow.readOnly,
  //     }
  //   }

  //   const apiFlow: PostApiV2privateFlowsOrgsFlowParams = {
  //     orgID,
  //     data: {
  //       orgID: orgID,
  //       name: _flow.name,
  //       spec: serialize(_flow),
  //     },
  //   }
  //   let id: string = `local_${UUID()}`
  //   try {
  //     id = await createAPI(apiFlow)
  //   } catch {
  //     dispatch(notify(notebookCreateFail()))
  //   }

  //   return new Promise(resolve => {
  //     setTimeout(() => {
  //       setFlows({
  //         ...flows,
  //         [id]: _flow,
  //       })

  //       setCurrentID(id)

  //       resolve(id)
  //     }, 200)
  //   })
  // }

  // const update = (id: string, flow: Flow) => {
  //   if (!flows.hasOwnProperty(id)) {
  //     throw new Error(`${PROJECT_NAME} not found`)
  //   }

  //   const data = {
  //     name: flow.name,
  //     range: flow.range,
  //     refresh: flow.refresh,
  //     data: flow.data.serialize ? flow.data.serialize() : flow.data,
  //     meta: flow.meta.serialize ? flow.meta.serialize() : flow.meta,
  //     readOnly: flow.readOnly,
  //   }

  //   setFlows({
  //     ...flows,
  //     [id]: data,
  //   })

  //   const apiFlow: PatchApiV2privateFlowsOrgsFlowParams = {
  //     id,
  //     orgID,
  //     data: {
  //       id,
  //       orgID,
  //       name: flow.name,
  //       spec: serialize(data),
  //     },
  //   }
  //   pooledUpdateAPI(apiFlow)
  // }

  // const remove = async (id: string) => {
  //   const _flows = {
  //     ...flows,
  //   }
  //   try {
  //     await deleteAPI({orgID, id} as DeleteApiV2privateFlowsOrgsFlowParams)
  //   } catch (error) {
  //     dispatch(notify(notebookDeleteFail()))
  //   }

  //   delete _flows[id]
  //   if (currentID === id) {
  //     setCurrentID(null)
  //   }

  //   setFlows(_flows)
  // }

  // const change = useCallback(
  //   (id: string) => {
  //     if (!Object.keys(flows).length) {
  //       getAll()
  //     }
  //     setCurrentID(id)
  //   },
  //   [setCurrentID, flows]
  // )

  return (
    <FunctionListContext.Provider
      value={{
        functionsList: functionsList,
        getAll,
      }}
    >
      {children}
    </FunctionListContext.Provider>
  )
}

export default FunctionListProvider
