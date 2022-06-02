// Libraries
import React, {createContext, FC, useContext, useMemo, useState} from 'react'
import {QueryScope, RemoteDataState} from 'src/types'

// Constants
import {
  CACHING_REQUIRED_END_DATE,
  CACHING_REQUIRED_START_DATE,
} from 'src/utils/datetime/constants'
import {
  DEFAULT_TAG_LIMIT,
  EXTENDED_TAG_LIMIT,
} from 'src/shared/constants/queryBuilder'

// Contexts
import {
  IMPORT_REGEXP,
  IMPORT_INFLUX_SCHEMA,
  SAMPLE_DATA_SET,
  FROM_BUCKET,
} from 'src/dataExplorer/context/fluxQueryBuilder'
import {QueryContext} from 'src/shared/contexts/query'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

interface FieldsContextType {
  fields: Array<string>
  loading: RemoteDataState
  getFields: (bucket: any, measurement: string) => void
  resetFields: () => void
}

const DEFAULT_CONTEXT: FieldsContextType = {
  fields: [],
  loading: RemoteDataState.NotStarted,
  getFields: (_b: any, _m: string) => {},
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

  // Constant
  const limit = isFlagEnabled('increasedMeasurmentTagLimit')
    ? EXTENDED_TAG_LIMIT
    : DEFAULT_TAG_LIMIT

  const getFields = async (bucket: any, measurement: string) => {
    if (!bucket || !measurement) {
      return
    }

    setLoading(RemoteDataState.Loading)

    // Simplified version of query from this file:
    //   src/flows/pipes/QueryBuilder/context.tsx
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
      |> sort()
      |> limit(n: ${limit})
    `

    if (bucket.type !== 'sample' && isFlagEnabled('newQueryBuilder')) {
      _source = `${IMPORT_REGEXP}${IMPORT_INFLUX_SCHEMA}`
      queryText = `${_source}
        schema.measurementFieldKeys(
          bucket: "${bucket.name}",
          measurement: "${measurement}",
          start: ${CACHING_REQUIRED_START_DATE},
          stop: ${CACHING_REQUIRED_END_DATE},
        )
          |> sort()
          |> limit(n: ${limit})
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
