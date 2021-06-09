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
import {getAll} from 'src/resources/selectors'
import {getOrg} from 'src/organizations/selectors'

// Types
import {AppState, ResourceType, Bucket, Authorization} from 'src/types'

interface WriteDataDetailsContextType {
  bucket: Bucket
  changeBucket: (bucket: Bucket) => void
  token: Authorization
  changeToken: (token: Authorization) => void
  query: string
  changeQuery: (query: string) => void
}

export const DEFAULT_WRITE_DATA_DETAILS_CONTEXT: WriteDataDetailsContextType = {
  bucket: null,
  changeBucket: () => {},
  token: null,
  changeToken: () => {},
  query: null,
  changeQuery: () => {},
}

export const WriteDataDetailsContext = createContext<
  WriteDataDetailsContextType
>(DEFAULT_WRITE_DATA_DETAILS_CONTEXT)

const WriteDataDetailsProvider: FC = ({children}) => {
  const {variables, update} = useContext(TemplateContext)
  const buckets = useSelector((state: AppState) =>
    getAll<Bucket>(state, ResourceType.Buckets).filter(b => b.type === 'user')
  )
  const tokens = useSelector((state: AppState) =>
    getAll<Authorization>(state, ResourceType.Authorizations)
  )
  const org = useSelector(getOrg)
  const bucketname = useSelector(
    (state: AppState) => state.dataLoading?.steps?.bucket
  )
  const server = window.location.origin

  const toLoadBucket = buckets?.find(b => b.name === bucketname)

  const [bucket, setBucket] = useState(
    toLoadBucket ?? buckets[0] ?? ({name: '<BUCKET>'} as Bucket)
  )
  const [token, setToken] = useState(tokens[0] ?? {token: '<INFLUX_TOKEN>'})
  const [query, setQuery] = useState(null)

  const changeBucket = useCallback(
    (toChangeBucket: Bucket) => setBucket(toChangeBucket),
    [setBucket]
  )
  const changeQuery = useCallback(
    (toChangeQuery: string) => setQuery(toChangeQuery),
    [setQuery]
  )
  const changeToken = useCallback(
    (toChangeToken: Authorization) => setToken(toChangeToken),
    [setToken]
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
    if (bucket?.name === variables.bucket) {
      return
    }

    update({
      ...variables,
      bucket: bucket.name,
    })
  }, [variables, bucket?.name, bucket, update])

  useEffect(() => {
    if (token?.token === variables.token) {
      return
    }

    update({
      ...variables,
      token: token.token,
    })
  }, [variables, token?.token, token, update])

  return (
    <WriteDataDetailsContext.Provider
      value={{
        bucket,
        changeBucket,
        token,
        changeToken,
        query,
        changeQuery,
      }}
    >
      {children}
    </WriteDataDetailsContext.Provider>
  )
}

export default WriteDataDetailsProvider
