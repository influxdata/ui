import React, {FC, useCallback, useEffect, useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {
  getAllAPI,
  deleteAPI,
  createAPI,
  triggerAPI,
  updateAPI,
  getRunsAPI,
} from 'src/functions/context/api'
import {
  Function,
  FunctionRun,
  FunctionTriggerRequest,
  FunctionLanguage,
  FunctionTriggerResponse,
} from 'src/client/managedFunctionsRoutes'
import {getOrg} from 'src/organizations/selectors'
import {notify} from 'src/shared/actions/notifications'
import {
  functionCreateFail,
  functionGetFail,
  functionDeleteFail,
  functionTriggerFail,
  functionUpdateFail,
  runGetFail,
} from 'src/shared/copy/notifications'

export interface FunctionList {
  functionsList: {
    [key: string]: Function
  }
}

export interface DraftFunction extends Omit<Function, 'orgID' | 'language'> {
  params: string
}

const newDraftFunction = (): DraftFunction => {
  return {name: 'new Function', script: '', description: '', params: ''}
}

export interface FunctionListContextType extends FunctionList {
  runsList: FunctionRun[]
  draftFunction: DraftFunction
  getAll: () => void
  remove: (_id: string) => void
  setDraftFunctionByID: (id?: string) => void
  updateDraftFunction: (f: Partial<DraftFunction>) => void
  saveDraftFunction: () => void
  trigger: (
    _functionTrigger: Partial<FunctionTriggerRequest>
  ) => Promise<FunctionTriggerResponse>
  getRuns: (_functionID: string) => Promise<void>
}

export const DEFAULT_CONTEXT: FunctionListContextType = {
  functionsList: {},
  runsList: [],
  draftFunction: newDraftFunction(),
  getAll: () => {},
  remove: (_id: string) => {},
  setDraftFunctionByID: (_id: string) => {},
  updateDraftFunction: (_f: Partial<DraftFunction>) => {},
  saveDraftFunction: () => {},
  trigger: (_functionTrigger: Partial<FunctionTriggerRequest>) => {},
  getRuns: (_functionID: string) => {},
} as FunctionListContextType

export const FunctionListContext = React.createContext<FunctionListContextType>(
  DEFAULT_CONTEXT
)

export const FunctionListProvider: FC = ({children}) => {
  const dispatch = useDispatch()
  const {id: orgID} = useSelector(getOrg)

  const [functionsList, setFunctionsList] = useState({})

  const [runsList, setRunsList] = useState([])

  const [draftFunction, setDraftFunction] = useState(newDraftFunction())

  const getAll = useCallback(async (): Promise<void> => {
    try {
      const data = await getAllAPI(orgID)
      const _functions = {}
      data.functions.forEach(f => (_functions[f.id] = f))
      setFunctionsList(_functions)
    } catch {
      dispatch(notify(functionGetFail()))
    }
  }, [orgID, setFunctionsList, dispatch])

  const add = async (
    name: string,
    script: string,
    description?: string
  ): Promise<void> => {
    const _function = {
      name,
      script,
      description,
      orgID,
      language: 'python' as FunctionLanguage,
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

  const update = async (
    id: string,
    name: string,
    script: string,
    description: string
  ) => {
    try {
      const updatedFunction = await updateAPI(id, {name, script, description})
      const _functions = {
        ...functionsList,
      }
      _functions[id] = updatedFunction
      setFunctionsList(_functions)
    } catch (error) {
      dispatch(notify(functionUpdateFail()))
    }
  }

  const setDraftFunctionByID = useCallback(
    (functionID?: string) => {
      if (!functionID) {
        setDraftFunction(newDraftFunction())
      }
      if (functionsList[functionID]) {
        setDraftFunction(JSON.parse(JSON.stringify(functionsList[functionID])))
      }
    },
    [functionsList]
  )

  const updateDraftFunction = (partial: Partial<DraftFunction>) => {
    const _function = {...draftFunction, ...partial}
    setDraftFunction(_function)
  }

  const saveDraftFunction = () => {
    const {id, name, script, description} = draftFunction
    if (draftFunction.id) {
      update(id, name, script, description)
    } else {
      add(name, script, description)
    }
  }

  const trigger = async ({
    script,
    params,
  }): Promise<FunctionTriggerResponse> => {
    const paramObject = {}
    if (params) {
      params.split('\n').forEach((entry: string) => {
        const arr = entry.split('=')
        paramObject[arr[0]] = arr[1]
      })
    }

    try {
      const response = await triggerAPI({
        script,
        params: paramObject,
        language: 'python',
        orgID,
        method: 'POST',
      })
      return response
    } catch (error) {
      dispatch(notify(functionTriggerFail()))
      return {}
    }
  }

  const getRuns = useCallback(
    async (functionID: string) => {
      try {
        const runs = await getRunsAPI(functionID)
        setRunsList(runs)
      } catch (error) {
        // TODO remove this when api is available.
        setRunsList([
          {
            id: '1',
            status: 'ok',
            logs: [
              {
                message: 'this is a message',
                timestamp: '2021-02-18T23:48:27.283155000Z',
                severity: 'crit',
              },
            ],
            startedAt: '2021-02-18T23:48:27.283155000Z',
          },
          {
            id: '2',
            status: 'error',
            logs: [
              {
                message: 'oh no things got really bad',
                timestamp: '2021-02-18T23:48:27.283155000Z',
                severity: 'crit',
              },
              {
                message: 'it was terrible',
                timestamp: '2021-02-18T23:48:27.283155000Z',
                severity: 'crit',
              },
              {
                message: 'yuck',
                timestamp: '2021-02-18T23:48:27.283155000Z',
                severity: 'crit',
              },
            ],
            startedAt: '2021-02-18T23:48:27.283155000Z',
          },
          {
            id: '1',
            status: 'ok',
            logs: [
              {
                message: 'another message',
                timestamp: '2021-02-18T23:48:27.283155000Z',
                severity: 'crit',
              },
            ],
            startedAt: '2021-02-18T23:48:27.283155000Z',
          },
          {
            id: '1',
            status: 'ok',
            logs: [
              {
                message: 'you are doing great',
                timestamp: '2021-02-18T23:48:27.283155000Z',
                severity: 'crit',
              },
            ],
            startedAt: '2021-02-18T23:48:27.283155000Z',
          },
        ] as Array<FunctionRun>)

        dispatch(notify(runGetFail()))
      }
    },
    [setRunsList, dispatch]
  )

  useEffect(() => {
    getAll()
  }, [getAll])

  return (
    <FunctionListContext.Provider
      value={{
        functionsList,
        runsList,
        draftFunction,
        getAll,
        getRuns,
        remove,
        trigger,
        setDraftFunctionByID,
        updateDraftFunction,
        saveDraftFunction,
      }}
    >
      {children}
    </FunctionListContext.Provider>
  )
}

export default FunctionListProvider
