// Libraries
import React, {createContext, FC, useContext, useMemo, useState} from 'react'

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
} from 'src/dataExplorer/context/newDataExplorer'
import {QueryContext} from 'src/shared/contexts/query'

// Types
import {QueryScope, RemoteDataState} from 'src/types'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

interface MeasurementContextType {
  measurements: string[]
  loading: RemoteDataState
  getMeasurements: (bucket: any) => void
}

const DEFAULT_CONTEXT: MeasurementContextType = {
  measurements: [],
  loading: RemoteDataState.NotStarted,
  getMeasurements: (_: any) => {},
}

export const MeasurementContext = createContext<MeasurementContextType>(
  DEFAULT_CONTEXT
)

interface Prop {
  scope: QueryScope
}

export const MeasurementProvider: FC<Prop> = ({children, scope}) => {
  // Contexts
  const {query: queryAPI} = useContext(QueryContext)

  // States
  const [measurements, setMeasurements] = useState<Array<string>>([])
  const [loading, setLoading] = useState(RemoteDataState.NotStarted)

  // Constant
  const limit = isFlagEnabled('increasedMeasurmentTagLimit')
    ? EXTENDED_TAG_LIMIT
    : DEFAULT_TAG_LIMIT

  const getMeasurements = async bucket => {
    if (!bucket) {
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

    // TODO: is 30d large enough to get all measurement values?
    let queryText = `${_source}
      |> range(start: -30d, stop: now())
      |> filter(fn: (r) => true)
      |> keep(columns: ["_measurement"])
      |> group()
      |> distinct(column: "_measurement")
      |> limit(n: ${limit})
      |> sort()
    `

    if (bucket.type !== 'sample' && isFlagEnabled('newQueryBuilder')) {
      _source = `${IMPORT_REGEXP}${IMPORT_INFLUX_SCHEMA}`
      queryText = `${_source}
        schema.tagValues(
          bucket: "${bucket.name}",
          tag: "_measurement",
          predicate: (r) => true,
          start: ${CACHING_REQUIRED_START_DATE},
          stop: ${CACHING_REQUIRED_END_DATE},
        )
          |> limit(n: ${limit})
          |> sort()
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
      <MeasurementContext.Provider
        value={{measurements, loading, getMeasurements}}
      >
        {children}
      </MeasurementContext.Provider>
    ),
    [measurements, loading, children]
  )
}