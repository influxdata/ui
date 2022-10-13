// Libraries
import React, {createContext, FC, useContext, useMemo, useState} from 'react'

// Constants
import {
  CACHING_REQUIRED_END_DATE,
  CACHING_REQUIRED_START_DATE,
} from 'src/utils/datetime/constants'
import {DEFAULT_LIMIT} from 'src/shared/constants/queryBuilder'

// Contexts
import {QueryContext, QueryScope} from 'src/shared/contexts/query'

// Types
import {Bucket, RemoteDataState} from 'src/types'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {
  IMPORT_STRINGS,
  IMPORT_INFLUX_SCHEMA,
  IMPORT_SAMPLE_DATA_SET,
  FROM_BUCKET,
} from 'src/dataExplorer/shared/utils'

interface MeasurementsContextType {
  measurements: string[]
  loading: RemoteDataState
  getMeasurements: (bucket: Bucket) => void
}

const DEFAULT_CONTEXT: MeasurementsContextType = {
  measurements: [],
  loading: RemoteDataState.NotStarted,
  getMeasurements: (_: Bucket) => {},
}

export const MeasurementsContext =
  createContext<MeasurementsContextType>(DEFAULT_CONTEXT)

interface Prop {
  scope: QueryScope
}

export const MeasurementsProvider: FC<Prop> = ({children, scope}) => {
  // Contexts
  const {query: queryAPI} = useContext(QueryContext)

  // States
  const [measurements, setMeasurements] = useState<Array<string>>([])
  const [loading, setLoading] = useState(RemoteDataState.NotStarted)

  const getMeasurements = async bucket => {
    if (!bucket) {
      return
    }

    setLoading(RemoteDataState.Loading)

    // Simplified version of query from this file:
    //   src/flows/pipes/QueryBuilder/context.tsx
    let _source = ''
    if (bucket.type === 'sample') {
      _source += IMPORT_SAMPLE_DATA_SET(bucket.id)
    } else {
      _source += FROM_BUCKET(bucket.name)
    }

    let queryText = `${_source}
      |> range(start: -100y, stop: now())
      |> filter(fn: (r) => true)
      |> keep(columns: ["_measurement"])
      |> group()
      |> distinct(column: "_measurement")
      |> sort()
      |> limit(n: ${DEFAULT_LIMIT})
    `

    if (bucket.type !== 'sample' && isFlagEnabled('newQueryBuilder')) {
      _source = `${IMPORT_STRINGS}${IMPORT_INFLUX_SCHEMA}`
      queryText = `${_source}
        schema.measurements(
          bucket: "${bucket.name}",
          start: ${CACHING_REQUIRED_START_DATE},
          stop: ${CACHING_REQUIRED_END_DATE},
        )
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
      setMeasurements(values)
      setLoading(RemoteDataState.Done)
    } catch (e) {
      console.error(e.message)
      setLoading(RemoteDataState.Error)
    }
  }

  return useMemo(
    () => (
      <MeasurementsContext.Provider
        value={{measurements, loading, getMeasurements}}
      >
        {children}
      </MeasurementsContext.Provider>
    ),
    [measurements, loading, children]
  )
}
