import React, {FC, createContext, useContext, useCallback} from 'react'
import {PersistanceContext} from 'src/dataExplorer/context/persistance'
import {CLOUD} from 'src/shared/constants'

let postScript

if (CLOUD) {
  postScript = require('src/client/scriptsRoutes').postScript
}

interface ContextType {
  handleSave: (name: string, description: string) => void
}

const DEFAULT_CONTEXT = {
  handleSave: (_name: string, _description: string) => {},
}

export const ScriptContext = createContext<ContextType>(DEFAULT_CONTEXT)

export const ScriptProvider: FC = ({children}) => {
  const {query} = useContext(PersistanceContext)

  const handleSave = useCallback(
    async (name: string, description: string) => {
      if (postScript) {
        const resp = await postScript({
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
      } else {
        alert('You are in an unsupported environment')
      }
    },
    [query]
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
