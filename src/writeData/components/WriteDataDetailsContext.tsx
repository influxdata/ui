// Libraries
import React, {FC, createContext, useContext, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {Context as TemplateContext} from 'src/shared/components/CodeSnippet'

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
}

const DEFAULT_WRITE_DATA_DETAILS_CONTEXT: WriteDataDetailsContextType = {
  bucket: null,
  changeBucket: () => {},
  token: null,
  changeToken: () => {},
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
  const organization = useSelector(getOrg)
  const {origin} = window.location

  const [bucket, setBucket] = useState(buckets[0])
  const [token, setToken] = useState(tokens[0])

  useEffect(() => {
    if (origin === variables.origin) {
      return
    }

    update({
      ...variables,
      origin,
    })
  }, [variables, origin])

  useEffect(() => {
    if (organization?.id === variables.organization) {
      return
    }

    update({
      ...variables,
      organization: organization.id,
    })
  }, [variables, organization?.id])

  useEffect(() => {
    if (bucket?.name === variables.bucket) {
      return
    }

    update({
      ...variables,
      bucket: bucket.name,
    })
  }, [variables, bucket?.name])

  useEffect(() => {
    if (token?.token === variables.token) {
      return
    }

    update({
      ...variables,
      token: token.token,
    })
  }, [variables, token?.token])

  return (
    <WriteDataDetailsContext.Provider
      value={{
        bucket,
        changeBucket: (toChangeBucket: Bucket) => setBucket(toChangeBucket),
        token,
        changeToken: (toChangeToken: Authorization) => setToken(toChangeToken),
      }}
    >
      {children}
    </WriteDataDetailsContext.Provider>
  )
}

export default WriteDataDetailsProvider
