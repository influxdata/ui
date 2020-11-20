// Libraries
import React, {FC, useContext, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Contexts
import {PipeContext} from 'src/flows/context/pipe'
import {FlowContext} from 'src/flows/context/flow.current'

// Utils
import {normalizeSchema} from 'src/shared/utils/flowSchemaNormalizer'
import {
  getAndSetBucketSchema,
  startWatchDog,
} from 'src/shared/actions/schemaThunks'

// Types
import {AppState, RemoteDataState} from 'src/types'

export type Props = {
  children: JSX.Element
}

export interface SchemaContextType {
  loading: RemoteDataState
  measurements: string[]
  fields: string[]
  tags: any[]
  searchTerm: string
  setSearchTerm: (value: string) => void
}

export const DEFAULT_CONTEXT: SchemaContextType = {
  loading: RemoteDataState.NotStarted,
  measurements: [],
  fields: [],
  tags: [],
  searchTerm: '',
  setSearchTerm: (_: string) => {},
}

export const SchemaContext = React.createContext<SchemaContextType>(
  DEFAULT_CONTEXT
)

export const SchemaProvider: FC<Props> = React.memo(({children}) => {
  const {data, update} = useContext(PipeContext)
  const {flow} = useContext(FlowContext)
  const [searchTerm, setSearchTerm] = useState('')
  const [lastBucket, setLastBucket] = useState(data?.bucket?.id)
  const dispatch = useDispatch()

  const loading = useSelector(
    (state: AppState) =>
      state.flow.schema[data.bucket?.name]?.status || RemoteDataState.NotStarted
  )

  useEffect(() => {
    if (data?.bucket?.id === lastBucket) {
      return
    }

    setLastBucket(data?.bucket?.id)
    setSearchTerm('')
    update({
      field: '',
      tags: {},
      measurement: '',
    })
  }, [data?.bucket?.id, lastBucket, update])

  useEffect(() => {
    dispatch(startWatchDog())
  }, [dispatch])

  useEffect(() => {
    if (!data.bucket) {
      return
    }

    dispatch(getAndSetBucketSchema(data.bucket, flow.range))
  }, [data?.bucket, dispatch, flow?.range])

  const schema = useSelector(
    (state: AppState) => state.flow.schema[data.bucket?.name]?.schema || {}
  )

  const {fields, measurements, tags} = normalizeSchema(schema, data, searchTerm)

  return (
    <SchemaContext.Provider
      value={{
        loading,
        measurements,
        fields,
        tags,
        searchTerm,
        setSearchTerm,
      }}
    >
      {children}
    </SchemaContext.Provider>
  )
})

export default SchemaProvider
