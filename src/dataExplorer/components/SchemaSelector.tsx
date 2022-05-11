import React, {FC, createContext, useState} from 'react'

// types
import {Bucket, RemoteDataState} from 'src/types'

interface NewDataExplorerContextType {
  query: string
  loading: RemoteDataState
  results: any

  updateQuery: (q: string) => void
}

const DEFAULT_CONTEXT: NewDataExplorerContextType = {
  query: '',
  loading: RemoteDataState.NotStarted,
  results: null,

  updateQuery: _q => {},
}

export const NewDataExplorerContext = createContext<NewDataExplorerContextType>(
  DEFAULT_CONTEXT
)

export const NewDataExplorerProvider: FC = ({children}) => {
  const [loading] = useState(RemoteDataState.NotStarted)
  const [query, setQuery] = useState('')

  return (
    <NewDataExplorerContext.Provider
      value={{
        loading,
        query,
        updateQuery: setQuery,
      }}
    >
      {children}
    </NewDataExplorerContext.Provider>
  )
}
