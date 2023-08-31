// Libraries
import React, {createContext, FC, useContext, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'

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
import {
  IMPORT_STRINGS,
  IMPORT_INFLUX_SCHEMA,
  SAMPLE_DATA_SET,
  sanitizeSQLSearchTerm,
} from 'src/dataExplorer/shared/utils'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Selectors
import {isOrgIOx} from 'src/organizations/selectors'
import {LanguageType} from '../components/resources'

interface MeasurementsContextType {
  measurements: string[]
  loading: RemoteDataState
  getMeasurements: (bucket: Bucket, searchTerm?: string) => void
}

const DEFAULT_CONTEXT: MeasurementsContextType = {
  measurements: [],
  loading: RemoteDataState.NotStarted,
  getMeasurements: (_b: Bucket, _s: string) => {},
}

export const MeasurementsContext =
  createContext<MeasurementsContextType>(DEFAULT_CONTEXT)

interface Prop {
  scope: QueryScope
}

export const MeasurementsProvider: FC<Prop> = ({children, scope}) => {
  const isIOx = useSelector(isOrgIOx)

  // Contexts
  const {query: queryAPI} = useContext(QueryContext)

  // States
  const [measurements, setMeasurements] = useState<Array<string>>([])
  const [loading, setLoading] = useState(RemoteDataState.NotStarted)

  const getMeasurements = async (bucket: Bucket, searchTerm: string = '') => {
    if (!bucket) {
      return
    }

    setLoading(RemoteDataState.Loading)

    if (isFlagEnabled('v2privateQueryUI') && isIOx) {
      // user input is sanitized to avoid SQL injection
      const sanitized = sanitizeSQLSearchTerm(searchTerm)
      const queryTextSQL: string = `
        SELECT table_name
        FROM information_schema.tables
        WHERE
            table_schema = 'iox'
            AND table_name ILIKE '%${sanitized}%'
        LIMIT ${DEFAULT_LIMIT}
      `

      try {
        const resp = await queryAPI(queryTextSQL, scope, {
          language: LanguageType.SQL, // use SQL to get measurement list
          bucket,
        })
        // Measurements are strings only, so cast to string[] intentionally
        // https://docs.influxdata.com/influxdb/cloud-serverless/get-started/write/#:~:text=String%20that%20identifies%20the%20measurement%20to%20store%20the%20data%20in
        const measurements = (resp.parsed.table?.columns?.table_name?.data ??
          []) as string[]
        setMeasurements(measurements)
        setLoading(RemoteDataState.Done)
      } catch (e) {
        console.error(e.message)
        setLoading(RemoteDataState.Error)
      }
      return
    }

    // Simplified version of query from this file:
    //   src/flows/pipes/QueryBuilder/context.tsx
    const queryText =
      bucket.type === 'sample'
        ? `${SAMPLE_DATA_SET(bucket.id)}
      |> range(start: -100y, stop: now())
      |> filter(fn: (r) => true)
      |> keep(columns: ["_measurement"])
      |> group()
      |> distinct(column: "_measurement")
      |> sort()
      |> limit(n: ${DEFAULT_LIMIT})
    `
        : `${IMPORT_STRINGS}${IMPORT_INFLUX_SCHEMA}
      schema.measurements(
        bucket: "${bucket.name}",
        start: ${CACHING_REQUIRED_START_DATE},
        stop: ${CACHING_REQUIRED_END_DATE},
      )
      |> map(fn: (r) => ({r with lowercase: strings.toLower(v: r._value)}))
      |> sort(columns: ["lowercase"])
      |> limit(n: ${DEFAULT_LIMIT})
    `

    try {
      const resp = await queryAPI(queryText, scope)
      // Measurements are strings only, so cast to string[] intentionally
      // https://docs.influxdata.com/influxdb/cloud/get-started/write/#:~:text=String%20that%20identifies%20the%20measurement%20to%20store%20the%20data%20in
      const measurements = (resp.parsed.table?.columns['_value']?.data ??
        []) as string[]

      setMeasurements(measurements)
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
