import React, {FC, createContext, useContext, useCallback} from 'react'
import {useDispatch} from 'react-redux'
import * as api from 'src/client/scriptsRoutes'
import {notify} from 'src/shared/actions/notifications'
import {
  scriptSaveFail,
  scriptSaveSuccess,
} from 'src/shared/copy/notifications/categories/scripts'
import {PersistanceContext} from 'src/dataExplorer/context/persistance'

interface ContextType {
  handleSave: (name: string, description: string) => void
}

const DEFAULT_CONTEXT = {
  handleSave: (_name: string, _description: string) => {},
}

export const ScriptContext = createContext<ContextType>(DEFAULT_CONTEXT)

export const ScriptProvider: FC = ({children}) => {
  const dispatch = useDispatch()
  const {query} = useContext(PersistanceContext)

  const handleSave = useCallback(
    async (name: string, description: string) => {
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
    },
    [dispatch, query]
  )

  return (
    <ScriptContext.Provider
      value={{
        handleSave,
      }}
    >
      {children}
    </ScriptContext.Provider>
  )
}
