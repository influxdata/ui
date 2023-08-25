// Libraries
import React, {createContext, FC, useContext, useMemo, useState} from 'react'
import {Bucket, RemoteDataState} from 'src/types'
import {useSelector} from 'react-redux'

// Constants
import {
  CACHING_REQUIRED_END_DATE,
  CACHING_REQUIRED_START_DATE,
} from 'src/utils/datetime/constants'
import {DEFAULT_LIMIT} from 'src/shared/constants/queryBuilder'
import {LanguageType} from 'src/dataExplorer/components/resources'

// Contexts
import {QueryContext, QueryOptions, QueryScope} from 'src/shared/contexts/query'
import {ResultsViewContext} from 'src/dataExplorer/context/resultsView'

// Utils
import {
  IMPORT_REGEXP,
  IMPORT_STRINGS,
  IMPORT_INFLUX_SCHEMA,
  SAMPLE_DATA_SET,
  SEARCH_STRING,
  sanitizeSQLSearchTerm,
} from 'src/dataExplorer/shared/utils'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Selectors
import {isOrgIOx} from 'src/organizations/selectors'

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
  const isIOx = useSelector(isOrgIOx)

  // Contexts
  const {query: queryAPI} = useContext(QueryContext)
  const {setDefaultViewOptions} = useContext(ResultsViewContext)

  // States
  const [fields, setFields] = useState<Array<string>>(
    JSON.parse(JSON.stringify(INITIAL_FIELDS))
  )
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

    if (isFlagEnabled('v2privateQueryUI') && isIOx) {
      // user input is sanitized to avoid SQL injection
      const sanitized = sanitizeSQLSearchTerm(searchTerm)
      const queryTextSQL: string = `
      SELECT column_name
      FROM information_schema.columns
      WHERE
           table_schema = 'iox'
           AND data_type NOT LIKE 'Dictionary%'
           AND table_name = '${measurement}'
           AND column_name != 'time'
           AND column_name ILIKE '%${sanitized}%'
      LIMIT ${DEFAULT_LIMIT}
      `
      try {
        const resp = await queryAPI(queryTextSQL, scope, {
          language: LanguageType.SQL,
          bucket,
        } as QueryOptions)
        const values = (resp.parsed.table?.columns?.column_name?.data ??
          []) as string[]
        setFields(values)
        setLoading(RemoteDataState.Done)
        setDefaultViewOptions({smoothing: {columns: values}})
      } catch (e) {
        console.error(e.message)
        setLoading(RemoteDataState.Error)
      }
      return
    }

    // Simplified version of query from this file:
    //   src/flows/pipes/QueryBuilder/context.tsx
    // Note that sample buckets are not in storage level.
    //   They are fetched dynamically from csv.
    //   Here is the source code for handling sample data:
    //   https://github.com/influxdata/flux/blob/master/stdlib/influxdata/influxdb/sample/sample.flux
    //   That is why the source and query script for sample data is different
    const queryText =
      bucket.type === 'sample'
        ? `${IMPORT_REGEXP}${SAMPLE_DATA_SET(bucket.id)}
      |> range(start: -100y, stop: now())
      |> filter(fn: (r) => (r["_measurement"] == "${measurement}"))
      |> keep(columns: ["_field"])
      |> group()
      |> distinct(column: "_field")
      ${searchTerm ? SEARCH_STRING(searchTerm) : ''}
      |> sort()
      |> limit(n: ${DEFAULT_LIMIT})
    `
        : `${IMPORT_REGEXP}${IMPORT_INFLUX_SCHEMA}${IMPORT_STRINGS}
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

    try {
      const resp = await queryAPI(queryText, scope)
      const values = (Object.values(resp.parsed.table.columns).filter(
        c => c.name === '_value' && c.type === 'string'
      )[0]?.data ?? []) as string[]
      setFields(values)
      setLoading(RemoteDataState.Done)
      setDefaultViewOptions({smoothing: {columns: values}})
    } catch (e) {
      console.error(e.message)
      setLoading(RemoteDataState.Error)
    }
  }

  const resetFields = () => {
    setFields(JSON.parse(JSON.stringify(INITIAL_FIELDS)))
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
