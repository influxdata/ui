// Libraries
import React, {FC, useContext, useEffect, useMemo, useState} from 'react'

// Contexts
import {QueryContext} from 'src/flows/context/query'
import {PipeContext} from 'src/flows/context/pipe'
import {FlowContext} from 'src/flows/context/flow.current'

// Utils
import {formatTimeRangeArguments} from 'src/timeMachine/apis/queryBuilder'

// Types
import {FluxResult, RemoteDataState, PipeData} from 'src/types'
import {FromFluxResult} from '@influxdata/giraffe'
import {RunQueryResult} from 'src/shared/apis/query'

interface Tag {
  [tagName: string]: Set<string | number>
}

interface SchemaValues {
  fields: string[]
  tags: Tag
  type?: string
}

interface Schema {
  [measurement: string]: SchemaValues
}

export interface NormalizedTag {
  [tagName: string]: string[] | number[]
}

interface NormalizedSchema {
  measurements: string[]
  fields: string[]
  tags: NormalizedTag[]
}

interface SchemaContextType {
  loading: RemoteDataState
  measurements: string[]
  fields: string[]
  tags: NormalizedTag[]
  searchTerm: string
  setSearchTerm: (value: string) => void
}

const DEFAULT_CONTEXT: SchemaContextType = {
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

const normalizeSchema = (
  schema: Schema,
  data: PipeData,
  searchTerm: string
): NormalizedSchema => {
  const {measurements, fields, tags} = Object.entries(schema || {})
    .map(([measurement, values]) => ({
      measurement: measurement,
      fields: values.fields.filter(
        f =>
          (!!data.field && f === data.field) ||
          (!data.field && f.toLowerCase().includes(searchTerm.toLowerCase()))
      ),
      tags: Object.entries(values.tags).filter(
        ([name, values]) =>
          !searchTerm ||
          Array.from(values).some(value =>
            `${('' + name).toLowerCase()} = ${(
              '' + value
            ).toLowerCase()}`.includes(searchTerm.toLowerCase())
          )
      ),
    }))
    .filter(values => {
      if (data.measurement) {
        return values.measurement === data.measurement
      }

      if (data.field) {
        return values.fields.length
      }

      if (searchTerm) {
        return (
          `measurement = ${values.measurement.toLowerCase()}`.includes(
            searchTerm.toLowerCase()
          ) ||
          values.fields.length ||
          values.tags.length
        )
      }

      return true
    })
    .reduce(
      (acc, curr) => {
        acc.measurements[curr.measurement] = true
        curr.fields.reduce((facc, fcurr) => {
          facc[fcurr] = true
          return facc
        }, acc.fields)
        curr.tags.reduce((tacc, [tag, values]) => {
          if (!tacc[tag]) {
            tacc[tag] = new Set()
          }

          values.forEach(v => tacc[tag].add('' + v))

          return tacc
        }, acc.tags)
        return acc
      },
      {
        measurements: {},
        fields: {},
        tags: {},
      }
    )

  return {
    measurements: Object.keys(measurements),
    fields: Object.keys(fields),
    tags: Object.entries(tags).map(([tag, value]) => ({
      [tag as string]: Array.from(value as ArrayLike<string>),
    })),
  }
}

export const SchemaProvider: FC = React.memo(({children}) => {
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
    if (!data?.bucket || loading === RemoteDataState.Loading) {
      return
    }

    setLoading(RemoteDataState.Loading)

    console.log('neat', data.bucket.name, lastBucket.id, range, query)

    const text = `from(bucket: "${data.bucket.name}")
|> range(${range})
|> first()
|> drop(columns: ["_value"])
|> group()`

    query(text)
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
  }, [data?.bucket?.name, lastBucket?.id, range]) // eslint-disable-line react-hooks/exhaustive-deps

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
