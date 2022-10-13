// Libraries
import React, {
  createContext,
  FC,
  useCallback,
  useContext,
  useMemo,
  useState,
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
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {
  IMPORT_REGEXP,
  IMPORT_STRINGS,
  IMPORT_INFLUX_SCHEMA,
  IMPORT_SAMPLE,
  FROM_SAMPLE_DATA,
  FROM_BUCKET,
  SEARCH_STRING,
} from 'src/dataExplorer/shared/utils'

interface GroupKeysContextType {
  groupKeys: Array<string>
  loading: RemoteDataState
  getGroupKeys: (
    bucket: Bucket,
    measurement: string,
    searchTerm?: string
  ) => void
}

const DEFAULT_CONTEXT: GroupKeysContextType = {
  groupKeys: [],
  loading: RemoteDataState.NotStarted,
  getGroupKeys: (_b: Bucket, _m: string, _s: string) => {},
}

export const GroupKeysContext =
  createContext<GroupKeysContextType>(DEFAULT_CONTEXT)

const INITIAL_GROUP_KEYS = [] as Array<string>

interface Prop {
  scope: QueryScope
}

export const GroupKeysProvider: FC<Prop> = ({children, scope}) => {
  // Context
  const {query: queryAPI} = useContext(QueryContext)

  // States
  const [groupKeys, setGroupKeys] = useState<Array<string>>(INITIAL_GROUP_KEYS)
  const [loading, setLoading] = useState<RemoteDataState>(
    RemoteDataState.NotStarted
  )

  const getGroupKeys = useCallback(
    async (bucket: Bucket, measurement: string, searchTerm?: string) => {
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
      let _imports = IMPORT_REGEXP
      let _from = ''
      if (bucket.type === 'sample') {
        _imports += IMPORT_SAMPLE
        _from += FROM_SAMPLE_DATA(bucket.id)
      } else {
        _from += FROM_BUCKET(bucket.name)
      }

      let queryText = `${_imports}
      fields = ${_from}
      |> range(start: -100y, stop: now())
      |> filter(fn: (r) => (r["_measurement"] == "${measurement}"))
      |> keep(columns: ["_field"])
      |> group()
      |> distinct(column: "_field")
      ${searchTerm ? SEARCH_STRING(searchTerm) : ''}

      tagKeys = ${_from}
      |> range(start: -100y, stop: now())
      |> filter(fn: (r) => true)
      |> keys()
      |> keep(columns: ["_value"])
      |> distinct()
      |> filter(fn: (r) => r._value != "_measurement" and r._value != "_field")
      |> filter(fn: (r) => r._value != "_time" and r._value != "_start" and r._value !=  "_stop" and r._value != "_value")
      ${searchTerm ? SEARCH_STRING(searchTerm) : ''}

      union(tables: [fields, tagKeys])
      |> group()
      |> sort()
      |> limit(n: ${DEFAULT_LIMIT})
    `

      if (bucket.type !== 'sample' && isFlagEnabled('newQueryBuilder')) {
        _imports = `${IMPORT_REGEXP}${IMPORT_INFLUX_SCHEMA}${IMPORT_STRINGS}`
        queryText = `${_imports}
      fields = schema.measurementFieldKeys(
        bucket: "${bucket.name}",
        measurement: "${measurement}",
        start: ${CACHING_REQUIRED_START_DATE},
        stop: ${CACHING_REQUIRED_END_DATE},
      )
      ${searchTerm ? SEARCH_STRING(searchTerm) : ''}

      tagKeys = schema.measurementTagKeys(
        bucket: "${bucket.name}",
        measurement: "${measurement}",
        start: ${CACHING_REQUIRED_START_DATE},
        stop: ${CACHING_REQUIRED_END_DATE},
      )
      |> filter(fn: (r) => r._value != "_measurement" and r._value != "_field")
      |> filter(fn: (r) => r._value != "_start" and r._value != "_stop")
      ${searchTerm ? SEARCH_STRING(searchTerm) : ''}

      union(tables: [fields, tagKeys])
      |> group()
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

        setGroupKeys(values)
        setLoading(RemoteDataState.Done)
      } catch (err) {
        console.error(
          `Failed to get group keys for bucket ${bucket.name} and measurement ${measurement}\n`,
          err.message
        )
        setLoading(RemoteDataState.Error)
      }
    },
    [queryAPI, scope]
  )

  return useMemo(
    () => (
      <GroupKeysContext.Provider value={{groupKeys, loading, getGroupKeys}}>
        {children}
      </GroupKeysContext.Provider>
    ),
    [groupKeys, loading, children, getGroupKeys]
  )
}
