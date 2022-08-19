// Libraries
import React, {createContext, FC, useContext, useMemo, useState} from 'react'
import {Bucket, RemoteDataState} from 'src/types'

// Constants
import {
  CACHING_REQUIRED_END_DATE,
  CACHING_REQUIRED_START_DATE,
} from 'src/utils/datetime/constants'
import {DEFAULT_LIMIT} from 'src/shared/constants/queryBuilder'

// Contexts
import {QueryContext, QueryScope} from 'src/shared/contexts/query'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {
  IMPORT_REGEXP,
  IMPORT_STRINGS,
  IMPORT_INFLUX_SCHEMA,
  SAMPLE_DATA_SET,
  FROM_BUCKET,
  SEARCH_STRING,
} from 'src/dataExplorer/shared/utils'

interface FieldsContextType {
  fields: Array<string>
  loading: RemoteDataState
  getFields: (bucket: Bucket, measurement: string, searchTerm?: string) => void
  resetFields: () => void
}

const DEFAULT_CONTEXT: FieldsContextType = {
  fields: [],
  loading: RemoteDataState.NotStarted,
  getFields: (_b: Bucket, _m: string, _s: string) => {},
  resetFields: () => {},
}

export const FieldsContext = createContext<FieldsContextType>(DEFAULT_CONTEXT)

const INITIAL_FIELDS = [] as string[]

interface Prop {
  scope: QueryScope
}

export const FieldsProvider: FC<Prop> = ({children, scope}) => {
  // Contexts
  const {query: queryAPI} = useContext(QueryContext)

  // States
  const [fields, setFields] = useState<Array<string>>(INITIAL_FIELDS)
  const [loading, setLoading] = useState<RemoteDataState>(
    RemoteDataState.NotStarted
  )

  const getFields = async (
    bucket: Bucket,
    measurement: string,
    searchTerm?: string
  ) => {
    if (!bucket || !measurement) {
      return
    }

    setLoading(RemoteDataState.Loading)

    // Simplified version of query from this file:
    //   src/flows/pipes/QueryBuilder/context.tsx
    // Note that sample buckets are not in storage level.
    //   They are fetched dynamically from csv.
    //   Here is the source code for handling sample data:
    //   https://github.com/influxdata/flux/blob/master/stdlib/influxdata/influxdb/sample/sample.flux
    //   That is why _source and query script for sample data is different
    let _source = IMPORT_REGEXP
    if (bucket.type === 'sample') {
      _source += SAMPLE_DATA_SET(bucket.id)
    } else {
      _source += FROM_BUCKET(bucket.name)
    }

    let queryText = `${_source}
      |> range(start: -100y, stop: now())
      |> filter(fn: (r) => (r["_measurement"] == "${measurement}"))
      |> keep(columns: ["_field"])
      |> group()
      |> distinct(column: "_field")
      ${searchTerm ? SEARCH_STRING(searchTerm) : ''}
      |> sort()
      |> limit(n: ${DEFAULT_LIMIT})
    `

    if (bucket.type !== 'sample' && isFlagEnabled('newQueryBuilder')) {
      _source = `${IMPORT_REGEXP}${IMPORT_INFLUX_SCHEMA}${IMPORT_STRINGS}`
      queryText = `${_source}
        schema.measurementFieldKeys(
          bucket: "${bucket.name}",
          measurement: "${measurement}",
          start: ${CACHING_REQUIRED_START_DATE},
          stop: ${CACHING_REQUIRED_END_DATE},
        )
        ${searchTerm ? SEARCH_STRING(searchTerm) : ''}
        |> map(fn: (r) => ({r with lowercase: strings.toLower(v: r._value)}))
        |> sort(columns: ["lowercase"])
        |> limit(n: ${DEFAULT_LIMIT})
      `
    }

    try {
      const resp = await queryAPI(queryText, scope)
      const values = (Object.values(resp.parsed.table.columns).filter(
        c => c.name === '_value' && c.type === 'string'
      )[0]?.data ?? []) as string[]
      setFields(values)
      setLoading(RemoteDataState.Done)
    } catch (e) {
      console.error(e.message)
      setLoading(RemoteDataState.Error)
    }
  }

  const resetFields = () => {
    setFields(INITIAL_FIELDS)
    setLoading(RemoteDataState.NotStarted)
  }

  return useMemo(
    () => (
      <FieldsContext.Provider value={{fields, loading, getFields, resetFields}}>
        {children}
      </FieldsContext.Provider>
    ),
    [fields, loading]
  )
}
