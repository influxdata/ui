// Libraries
import React, {FC, useContext, useEffect, useState} from 'react'
import {fromFlux} from '@influxdata/giraffe'

// Contexts
import {PipeContext} from 'src/flows/context/pipe'
import {FlowContext} from 'src/flows/context/flow.current'

// Utils
import {normalizeSchema} from 'src/shared/utils/flowSchemaNormalizer'
import {formatTimeRangeArguments} from 'src/timeMachine/apis/queryBuilder'
import {findOrgID} from 'src/flows/shared/utils'

// Types
import {NormalizedTag, RemoteDataState} from 'src/types'
import {getCachedResultsOrRunQuery} from 'src/shared/apis/queryCache'
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

const csvToSchema = (result: RunQueryResult): unknown => {
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
  if (!result) {
    return
  }
  if (result?.type !== 'SUCCESS') {
    throw new Error(result.message)
  }

  const out = fromFlux(result.csv).table as any
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
  const [searchTerm, setSearchTerm] = useState('')
  const [lastBucket, setLastBucket] = useState(data?.bucket?.id)
  const [schema, setSchema] = useState({})
  const [loading, setLoading] = useState(RemoteDataState.NotStarted)
  const [fields, setFields] = useState([])
  const [measurements, setMeasurements] = useState([])
  const [tags, setTags] = useState([])

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
    if (!data?.bucket) {
      return
    }

    setLoading(RemoteDataState.Loading)

    const range = formatTimeRangeArguments(flow?.range)

    const query = `from(bucket: "${data.bucket.name}")
|> range(${range})
|> first()
|> drop(columns: ["_value"])
|> group()`

    const orgID = findOrgID(query, [data.bucket])
    const result = getCachedResultsOrRunQuery(orgID, query, [])
    result.promise
      .then((res: RunQueryResult) => {
        const schemaForBucket = csvToSchema(res)
        setSchema(schemaForBucket)
        setLoading(RemoteDataState.Done)
      })
      .catch((error: RunQueryResult) => {
        console.error('error: ', error)
        setLoading(RemoteDataState.Error)
        setSchema({})
      })
  }, [data?.bucket?.name, data?.bucket, flow?.range])

  useEffect(() => {
    const normalized = normalizeSchema(schema, data, searchTerm)
    setFields(normalized.fields)
    setMeasurements(normalized.measurements)
    setTags(normalized.tags)
  }, [data, searchTerm, schema])

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
