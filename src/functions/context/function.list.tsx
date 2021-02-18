import React, {FC, useCallback} from 'react'
import createPersistedState from 'use-persisted-state'
import {useSelector, useDispatch} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {
  getAllAPI,
  deleteAPI,
  createAPI,
  triggerAPI,
  updateAPI,
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
  functionRunFail,
  functionUpdateFail,
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
  update: (
    _id: string,
    _name?: string,
    _script?: string,
    _description?: string
  ) => Promise<void>
  trigger: (
    _functionTrigger: Partial<FunctionTriggerRequest>
  ) => Promise<FunctionRun>
}

export const DEFAULT_CONTEXT: FunctionListContextType = {
  functionsList: {},
  add: (_function?: FunctionCreateRequest) => {},
  remove: (_id: string) => {},
  update: (
    _id: string,
    _name?: string,
    _script?: string,
    _description?: string
  ) => {},
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
  const history = useHistory()

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
      history.push(`/orgs/${orgID}/functions/`)
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

  const update = async (
    id: string,
    name?: string,
    script?: string,
    description?: string
  ) => {
    try {
      const updatedFunction = await updateAPI(id, {name, script, description})
      const _functions = {
        ...functionsList,
      }
      _functions[id] = updatedFunction
      setFunctionsList(_functions)
      history.push(`/orgs/${orgID}/functions/`)
    } catch (error) {
      dispatch(notify(functionUpdateFail()))
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
    } catch (error) {
      dispatch(notify(functionRunFail()))
    }
  }

  return (
    <FunctionListContext.Provider
      value={{
        functionsList: functionsList,
        remove,
        add,
        update,
        getAll,
        trigger,
      }}
    >
      {children}
    </FunctionListContext.Provider>
  )
}

export default FunctionListProvider
