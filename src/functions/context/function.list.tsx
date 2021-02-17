import React, {FC, useCallback} from 'react'
import createPersistedState from 'use-persisted-state'
import {useSelector, useDispatch} from 'react-redux'
import {
  getAllAPI,
  deleteAPI,
  createAPI,
  triggerAPI,
} from 'src/functions/context/api'
import {
  Function,
  FunctionCreateRequest,
  FunctionRun,
  FunctionTriggerRequest,
} from 'src/client/managedFunctionsRoutes'
import {getOrg} from 'src/organizations/selectors'
import {notify} from 'src/shared/actions/notifications'
import {
  functionCreateFail,
  functionGetFail,
  functionDeleteFail,
} from 'src/shared/copy/notifications'

const useFunctionListState = createPersistedState('functions')

export interface FunctionList {
  functionsList: {
    [key: string]: Function
  }
}

export interface FunctionListContextType extends FunctionList {
  add: (_function: Partial<FunctionCreateRequest>) => Promise<void>
  remove: (_id: string) => void
  getAll: () => void
  trigger: (
    _functionTrigger: Partial<FunctionTriggerRequest>
  ) => Promise<FunctionRun>
}

export const DEFAULT_CONTEXT: FunctionListContextType = {
  functionsList: {},
  add: (_function?: FunctionCreateRequest) => {},
  remove: (_id: string) => {},
  getAll: () => {},
} as FunctionListContextType

export const FunctionListContext = React.createContext<FunctionListContextType>(
  DEFAULT_CONTEXT
)

export const FunctionListProvider: FC = ({children}) => {
  const [functionsList, setFunctionsList] = useFunctionListState(
    DEFAULT_CONTEXT.functionsList
  )
  const dispatch = useDispatch()

  const {id: orgID} = useSelector(getOrg)

  const getAll = useCallback(async (): Promise<void> => {
    try {
      const data = await getAllAPI(orgID)
      if (data.functions) {
        const _functions = {}
        data.functions.forEach(f => (_functions[f.id] = f))
        setFunctionsList(_functions)
      }
    } catch {
      dispatch(notify(functionGetFail()))
    }
  }, [orgID, setFunctionsList, dispatch])

  const add = async (
    partialFunction: Omit<FunctionCreateRequest, 'orgID' | 'language'>
  ): Promise<void> => {
    const _function = {
      ...partialFunction,
      orgID,
      language: 'python',
    }
    try {
      const createdFunction = await createAPI(_function)
      setFunctionsList({
        ...functionsList,
        [createdFunction.id]: createdFunction,
      })
    } catch {
      dispatch(notify(functionCreateFail()))
    }
  }

  const remove = async (id: string) => {
    const _functions = {
      ...functionsList,
    }
    try {
      await deleteAPI(id)

      delete _functions[id]
      setFunctionsList(_functions)
    } catch (error) {
      dispatch(notify(functionDeleteFail()))
    }
  }

  const trigger = async ({script, params}) => {
    const paramObject = {}

    params.split('\n').forEach((entry: string) => {
      const arr = entry.split('=')
      paramObject[arr[0]] = arr[1]
    })

    try {
      const run = await triggerAPI({
        script,
        params: paramObject,
        language: 'python',
        orgID,
      })
      return run
    } catch (error) {}
  }

  return (
    <FunctionListContext.Provider
      value={{
        functionsList: functionsList,
        remove,
        add,
        getAll,
        trigger,
      }}
    >
      {children}
    </FunctionListContext.Provider>
  )
}

export default FunctionListProvider
