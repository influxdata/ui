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
import {AppState, ResourceType, Bucket} from 'src/types'
import {event} from 'src/cloud/utils/reporting'

const DEFAULT_TOKEN = '<INFLUX_TOKEN>'
export const DEFAULT_BUCKET = '<BUCKET>'

interface WriteDataDetailsContextType {
  bucket: Bucket
  buckets: Bucket[]
  changeBucket: (bucket: Bucket) => void
  query: string
  changeQuery: (query: string) => void
}

export const DEFAULT_WRITE_DATA_DETAILS_CONTEXT: WriteDataDetailsContextType = {
  bucket: null,
  buckets: [],
  changeBucket: () => {},
  query: null,
  changeQuery: () => {},
}
export const WriteDataDetailsContext =
  createContext<WriteDataDetailsContextType>(DEFAULT_WRITE_DATA_DETAILS_CONTEXT)
const WriteDataDetailsProvider: FC = ({children}) => {
  const {variables, update} = useContext(TemplateContext)
  const buckets = useSelector((state: AppState) =>
    getAll<Bucket>(state, ResourceType.Buckets).filter(b => b.type === 'user')
  )
  const bucketname = useSelector(
    (state: AppState) => state.dataLoading?.steps?.bucket
  )
  const org = useSelector(getOrg)
  const server = window.location.origin
  const toLoadBucket = buckets?.find(b => b.name === bucketname)
  const [bucket, setBucket] = useState(
    toLoadBucket ?? buckets[0] ?? ({name: DEFAULT_BUCKET} as Bucket)
  )
  const [query, setQuery] = useState(null)

  const changeBucket = useCallback(
    (toChangeBucket: Bucket) => {
      event('selected bucket')
      setBucket(toChangeBucket)
    },
    [setBucket]
  )

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
    if (bucket?.name === variables.bucket) {
      return
    }
    update({
      ...variables,
      bucket: bucket?.name,
    })
  }, [variables, update, bucket])
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
        bucket,
        buckets,
        changeBucket,
        query,
        changeQuery,
      }}
    >
      {children}
    </WriteDataDetailsContext.Provider>
  )
}
export default WriteDataDetailsProvider
