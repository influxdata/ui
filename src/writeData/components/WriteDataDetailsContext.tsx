// Libraries
import React, {
  FC,
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react'
import {useSelector} from 'react-redux'
import {
  Context as TemplateContext,
  transform,
} from 'src/shared/components/CodeSnippet'
// Utils
import {getOrg} from 'src/organizations/selectors'

// Types
import {AppState, ResourceType} from 'src/types'

const DEFAULT_TOKEN = '<INFLUX TOKEN>'
const DEFAULT_BUCKET = '<BUCKET>'

interface WriteDataDetailsContextType {
  query: string
  changeQuery: (query: string) => void
}

export const DEFAULT_WRITE_DATA_DETAILS_CONTEXT: WriteDataDetailsContextType = {
  query: null,
  changeQuery: () => {},
}
export const WriteDataDetailsContext = createContext<
  WriteDataDetailsContextType
>(DEFAULT_WRITE_DATA_DETAILS_CONTEXT)
const WriteDataDetailsProvider: FC = ({children}) => {
  const {variables, update} = useContext(TemplateContext)
  const org = useSelector(getOrg)
  const server = window.location.origin
  const [query, setQuery] = useState(null)

  const changeQuery = useCallback(
    (toChangeQuery: string) => setQuery(toChangeQuery),
    [setQuery]
  )

  useEffect(() => {
    const _query = transform(query, variables)
    if (_query === variables.query) {
      return
    }
    update({
      ...variables,
      query: _query,
    })
  }, [variables, update, query])
  useEffect(() => {
    if (server === variables.server) {
      return
    }
    update({
      ...variables,
      server,
    })
  }, [variables, server, update])
  useEffect(() => {
    if (org?.name === variables.org) {
      return
    }
    update({
      ...variables,
      org: org.name,
    })
  }, [variables, org?.name, update])
  useEffect(() => {
    if (DEFAULT_BUCKET === variables.bucket) {
      return
    }
    update({
      ...variables,
      bucket: DEFAULT_BUCKET,
    })
  }, [variables, update])
  useEffect(() => {
    if (DEFAULT_TOKEN === variables.token) {
      return
    }
    update({
      ...variables,
      token: DEFAULT_TOKEN,
    })
  }, [variables, update])

  return (
    <WriteDataDetailsContext.Provider
      value={{
        query,
        changeQuery,
      }}
    >
      {children}
    </WriteDataDetailsContext.Provider>
  )
}
export default WriteDataDetailsProvider
