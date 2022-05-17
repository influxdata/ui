import React, {FC, createContext, useState, useMemo} from 'react'

// Types
import {RemoteDataState} from 'src/types'
import {NewDataExplorerData} from 'src/types/dataExplorer'

interface NewDataExplorerContextType {
  query: string
  loading: RemoteDataState
  data: NewDataExplorerData

  updateQuery: (q: string) => void
  updateData: (data: NewDataExplorerData) => void
}

const DEFAULT_CONTEXT: NewDataExplorerContextType = {
  query: '',
  loading: RemoteDataState.NotStarted,
  data: {},

  updateQuery: _q => {},
  updateData: () => {},
}

export const NewDataExplorerContext = createContext<NewDataExplorerContextType>(
  DEFAULT_CONTEXT
)

export const NewDataExplorerProvider: FC = ({children}) => {
  const [loading] = useState(RemoteDataState.NotStarted)
  const [query, setQuery] = useState('')
  const [data, setData] = useState({})

  return useMemo(
    () => (
      <NewDataExplorerContext.Provider
        value={{
          loading,
          query,
          data,
          updateQuery: setQuery,
          updateData: setData,
        }}
      >
        {children}
      </NewDataExplorerContext.Provider>
    ),
    [loading, query, data, children]
  )
}
