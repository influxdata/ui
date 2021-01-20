// Libraries
import React, {FC, useContext, useEffect, useMemo, useState} from 'react'

// Contexts
import {QueryContext} from 'src/flows/context/query'
import {PipeContext} from 'src/flows/context/pipe'
import {FlowContext} from 'src/flows/context/flow.current'

// Utils
import {normalizeSchema} from 'src/shared/utils/flowSchemaNormalizer'
import {formatTimeRangeArguments} from 'src/timeMachine/apis/queryBuilder'

// Types
import {FluxResult, NormalizedTag, RemoteDataState} from 'src/types'
import {FromFluxResult} from '@influxdata/giraffe'
import {RunQueryResult} from 'src/shared/apis/query'

export type Props = {
  children: JSX.Element
}

export interface SchemaContextType {
  loading: RemoteDataState
  measurements: string[]
  fields: string[]
  tags: NormalizedTag[]
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

const parsedResultToSchema = (parsed: FromFluxResult): unknown => {
  let ni, no
  const filtered = [
    /^_start$/,
    /^_stop$/,
    /^_time$/,
    /^_value/,
    /^_measurement$/,
    /^_field$/,
    /^table$/,
    /^result$/,
  ]
  if (!parsed) {
    return
  }

  const out = parsed.table as any
  const len = out.length
  const measurements = out.columns._measurement?.data
  const fields = out.columns._field?.data
  const columns = out.columnKeys.filter(key => {
    return filtered.reduce((acc, curr) => {
      return acc && !curr.test(key)
    }, true)
  })
  const colLen = columns.length
  const schema = {} as any

  for (ni = 0; ni < len; ni++) {
    if (!schema.hasOwnProperty(measurements[ni])) {
      schema[measurements[ni]] = {
        fields: new Set(),
        tags: {},
      }
    }

    schema[measurements[ni]].fields.add(fields[ni])

    for (no = 0; no < colLen; no++) {
      if (!out.columns[columns[no]].data[ni]) {
        continue
      }

      if (!schema[measurements[ni]].tags.hasOwnProperty(columns[no])) {
        schema[measurements[ni]].tags[columns[no]] = new Set()
      }
      schema[measurements[ni]].tags[columns[no]].add(
        out.columns[columns[no]].data[ni]
      )
    }
  }

  Object.entries(schema).forEach(([key, val]) => {
    schema[key].fields = Array.from((val as any).fields)
  })

  return schema
}

export const SchemaProvider: FC<Props> = React.memo(({children}) => {
  const {data, update} = useContext(PipeContext)
  const {flow} = useContext(FlowContext)
  const {query} = useContext(QueryContext)
  const [searchTerm, setSearchTerm] = useState('')
  const [lastBucket, setLastBucket] = useState(data?.bucket)
  const [schema, setSchema] = useState({})
  const [loading, setLoading] = useState(RemoteDataState.NotStarted)

  useEffect(() => {
    if (!data?.bucket || data?.bucket?.id === lastBucket?.id) {
      return
    }

    setLastBucket(data?.bucket)
    setSearchTerm('')
    setLoading(RemoteDataState.NotStarted)
    update({
      field: '',
      tags: {},
      measurement: '',
    })
  }, [data?.bucket?.id, lastBucket?.id, update]) // eslint-disable-line react-hooks/exhaustive-deps

  const range = formatTimeRangeArguments(flow?.range)

  useEffect(() => {
    if (!data?.bucket || loading !== RemoteDataState.NotStarted) {
      return
    }

    setLoading(RemoteDataState.Loading)

    const text = `from(bucket: "${data.bucket.name}")
|> range(${range})
|> first()
|> drop(columns: ["_value"])
|> group()`

    const result = query(text)
    result
      .then((response: FluxResult) => {
        const schemaForBucket = parsedResultToSchema(response.parsed)
        setSchema(schemaForBucket)
        setLoading(RemoteDataState.Done)
      })
      .catch((error: RunQueryResult) => {
        console.error('error: ', error)
        setLoading(RemoteDataState.Error)
        setSchema({})
      })
  }, [data?.bucket?.name, lastBucket?.id, query, range]) // eslint-disable-line react-hooks/exhaustive-deps

  const normalized = useMemo(() => normalizeSchema(schema, data, searchTerm), [
    data,
    schema,
    searchTerm,
  ])

  return (
    <SchemaContext.Provider
      value={{
        loading,
        measurements: normalized?.measurements ?? [],
        fields: normalized?.fields ?? [],
        tags: normalized?.tags ?? [],
        searchTerm,
        setSearchTerm,
      }}
    >
      {children}
    </SchemaContext.Provider>
  )
})

export default SchemaProvider
