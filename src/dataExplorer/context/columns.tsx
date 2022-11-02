import React, {
  FC,
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from 'react'

// Contexts
import {QueryContext, QueryScope} from 'src/shared/contexts/query'

// Constants
import {
  CACHING_REQUIRED_END_DATE,
  CACHING_REQUIRED_START_DATE,
} from 'src/utils/datetime/constants'
import {DEFAULT_LIMIT} from 'src/shared/constants/queryBuilder'

// Types
import {Bucket, RemoteDataState} from 'src/types'

// Utils
import {
  IMPORT_REGEXP,
  IMPORT_STRINGS,
  IMPORT_INFLUX_SCHEMA,
  SAMPLE_DATA_SET,
  FROM_BUCKET,
} from 'src/dataExplorer/shared/utils'

interface Props {
  scope: QueryScope
}

interface ColumnsContextType {
  columns: string[]
  loading: RemoteDataState
  getColumns: (bucket: Bucket, measurement: string) => void
  resetColumns: () => void
}

const DEFAULT_CONTEXT: ColumnsContextType = {
  columns: [],
  loading: RemoteDataState.NotStarted,
  getColumns: (_b: Bucket, _m: string) => {},
  resetColumns: () => {},
}

export const ColumnsContext = createContext<ColumnsContextType>(DEFAULT_CONTEXT)

export const ColumnsProvider: FC<Props> = ({children, scope}) => {
  // Context
  const {query: queryAPI} = useContext(QueryContext)

  // States
  const [columns, setColumns] = useState<string[]>([])
  const [loading, setLoading] = useState<RemoteDataState>(
    RemoteDataState.NotStarted
  )

  const getColumns = useCallback(
    async (bucket: Bucket, measurement: string) => {
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
        |> filter(fn: (r) => true)
        |> keys()
        |> keep(columns: ["_value"])
        |> distinct()
        |> filter(fn: (r) => r._value != "_value")
        |> filter(fn: (r) => r._value != "_time" and r._value != "_start" and r._value != "_stop")
        |> sort()
        |> limit(n: ${DEFAULT_LIMIT})
      `

      if (bucket.type !== 'sample') {
        _source = `${IMPORT_REGEXP}${IMPORT_INFLUX_SCHEMA}${IMPORT_STRINGS}`
        queryText = `${_source}
          schema.measurementTagKeys(
            bucket: "${bucket.name}",
            measurement: "${measurement}",
            start: ${CACHING_REQUIRED_START_DATE},
            stop: ${CACHING_REQUIRED_END_DATE},
          )
          |> filter(fn: (r) => r._value != "_time" and r._value != "_start" and r._value != "_stop")
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

        console.log({values})
        setColumns(values)
        setLoading(RemoteDataState.Done)
      } catch (err) {
        console.error(
          `Failed to get columns for bucket ${bucket.name} and measurement ${measurement}\n`,
          err.message
        )
        setLoading(RemoteDataState.Error)
      }
    },
    [queryAPI, scope]
  )

  const resetColumns = useCallback(() => {
    setColumns([])
    setLoading(RemoteDataState.NotStarted)
  }, [])

  return useMemo(
    () => (
      <ColumnsContext.Provider
        value={{columns, loading, getColumns, resetColumns}}
      >
        {children}
      </ColumnsContext.Provider>
    ),
    [children, columns, loading, getColumns, resetColumns]
  )
}
