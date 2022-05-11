import React, {FC, createContext} from 'react'

interface NewDataExplorerContextType {
  bucket: Bucket
  measurement: string
  query: string
  loading: RemoteDataState
  results: any

  updateQuery: (q: string) => void
}

const DEFAULT_CONTEXT: NewDataExplorerContextType = {
  bucket: null,
  measurement: null,
  query: '',
  loading: RemoteDataState.NotStarted,
  results: null,

  updateQuery: _q => {},
}

export const NewDataExplorerContext = createContext<NewDataExplorerContextType>(
  DEFAULT_CONTEXT
)

export const NewDataExplorerProvider: FC = ({children}) => {
  const [loading, setLoading] = useState(RemoteDataState.NotStarted)
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
