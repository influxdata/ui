// Libraries
import React, {FC, useContext, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Contexts
import {PipeContext} from 'src/notebooks/context/pipe'

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
  const [searchTerm, setSearchTerm] = useState('')
  const dispatch = useDispatch()

  const loading = useSelector(
    (state: AppState) =>
      state.notebook.schema[data.bucketName]?.status ||
      RemoteDataState.NotStarted
  )

  useEffect(() => {
    dispatch(startWatchDog())
  }, [dispatch])

  useEffect(() => {
    setSearchTerm('')
    update({
      field: '',
      tags: {},
      measurement: '',
    })
  }, [data.bucketName])

  useEffect(() => {
    if (loading !== RemoteDataState.NotStarted || !data.bucketName) {
      return
    }

    dispatch(getAndSetBucketSchema(data.bucketName))
  }, [data.bucketName, loading, dispatch])

  const schema = useSelector(
    (state: AppState) => state.notebook.schema[data.bucketName]?.schema || {}
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
