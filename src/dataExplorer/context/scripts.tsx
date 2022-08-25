import React, {
  FC,
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react'
import {useDispatch} from 'react-redux'
import * as api from 'src/client/scriptsRoutes'
import {notify} from 'src/shared/actions/notifications'
import {
  scriptSaveFail,
  scriptSaveSuccess,
} from 'src/shared/copy/notifications/categories/scripts'
import {PersistanceContext} from 'src/dataExplorer/context/persistance'

interface ContextType {
  description: string
  name: string

  handleSave: () => void
  updateDescription: (description: string) => void
  updateName: (name: string) => void
}

const DEFAULT_CONTEXT = {
  description: '',
  name: `Untitled Script: ${new Date().toISOString()}`,

  handleSave: () => {},
  updateDescription: (_description: string) => {},
  updateName: (_name: string) => {},
}

export const ScriptContext = createContext<ContextType>(DEFAULT_CONTEXT)

export const ScriptProvider: FC = ({children}) => {
  const dispatch = useDispatch()
  const [name, setName] = useState(DEFAULT_CONTEXT.name)
  const [description, setDescription] = useState('')
  const {query} = useContext(PersistanceContext)

  const handleUpdateDescription = useCallback(
    (text: string) => {
      setDescription(text)
    },
    [setDescription]
  )

  const handleUpdateName = useCallback(
    (text: string) => {
      setName(text)
    },
    [setName]
  )

  const handleSave = useCallback(async () => {
    try {
      if (api?.postScript) {
        const resp = await api.postScript({
          data: {
            name: name,
            description,
            script: query,
            language: 'flux',
          },
        })

        if (resp.status !== 201) {
          throw new Error(resp.data.message)
        }

        dispatch(notify(scriptSaveSuccess(name)))
      } else {
        alert('You are in an unsupported environment')
      }
    } catch (error) {
      dispatch(notify(scriptSaveFail(name)))
      console.error({error})
    }
  }, [dispatch, description, name, query])

  return (
    <ScriptContext.Provider
      value={{
        description,
        name,

        handleSave,
        updateDescription: handleUpdateDescription,
        updateName: handleUpdateName,
      }}
    >
      {children}
    </ScriptContext.Provider>
  )
}
