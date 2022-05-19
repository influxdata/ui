import React, {
  FC,
  createContext,
  useState,
  useMemo,
  useContext,
  useCallback,
} from 'react'
import {isEmpty} from 'lodash'

// Constants
import {
  CACHING_REQUIRED_END_DATE,
  CACHING_REQUIRED_START_DATE,
} from 'src/utils/datetime/constants'
import {
  DEFAULT_TAG_LIMIT,
  EXTENDED_TAG_LIMIT,
} from 'src/shared/constants/queryBuilder'

// Context
import {QueryContext} from 'src/shared/contexts/query'

// Types
import {Bucket, Field, QueryScope, RemoteDataState} from 'src/types'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

interface NewDataExplorerContextType {
  // Schema
  selectedBucket: Bucket
  measurements: string[] // TODO: type MeasurementSchema?
  selectedMeasurement: string // TODO: type Measurement?
  fields: Field[]
  tags: any[]
  searchTerm: string // for searching fields and tags
  selectBucket: (bucket: Bucket) => void
  selectMeasurement: (measurement: string) => void // TODO: type Measurement?
  setSearchTerm: (str: string) => void

  // Query building
  query: string
  loading: RemoteDataState
  updateQuery: (q: string) => void
}

const DEFAULT_CONTEXT: NewDataExplorerContextType = {
  // Schema
  selectedBucket: null,
  measurements: [],
  selectedMeasurement: '',
  fields: [],
  tags: [],
  searchTerm: '',
  selectBucket: (_b: Bucket) => {},
  selectMeasurement: (_m: string) => {},
  setSearchTerm: (_s: string) => {},

  // Query building
  query: '',
  loading: RemoteDataState.NotStarted,
  updateQuery: _q => {},
}

export const NewDataExplorerContext = createContext<NewDataExplorerContextType>(
  DEFAULT_CONTEXT
)

interface Prop {
  scope: QueryScope
}

export const NewDataExplorerProvider: FC<Prop> = ({scope, children}) => {
  const [loading] = useState(RemoteDataState.NotStarted)
  const {query: queryAPI} = useContext(QueryContext)
  const [query, setQuery] = useState('')
  const [selectedBucket, setSelectedBucket] = useState(null)
  const [measurements, setMeasurements] = useState<Array<string>>([])
  const [selectedMeasurement, setSelectedMeasurement] = useState('')
  const [fields, setFields] = useState([])
  const [tags, setTags] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const getMeasurements = useCallback(
    async bucket => {
      if (isEmpty(bucket)) {
        return
      }

      // Simplified version of query from this file:
      //   src/flows/pipes/QueryBuilder/context.tsx
      let _source = 'import "regexp"\n'
      if (bucket.type === 'sample') {
        _source += `import "influxdata/influxdb/sample"\nsample.data(set: "${bucket.id}")`
      } else {
        _source += `from(bucket: "${bucket.name}")`
      }

      const limit = isFlagEnabled('increasedMeasurmentTagLimit')
        ? EXTENDED_TAG_LIMIT
        : DEFAULT_TAG_LIMIT

      // TODO: can we do hard coded time range here?
      let queryText = `${_source}
    |> range(start: -30d, stop: now())
    |> filter(fn: (r) => true)
    |> keep(columns: ["_measurement"])
    |> group()
    |> distinct(column: "_measurement")
    |> limit(n: ${limit})
    |> sort()`

      if (bucket.type !== 'sample' && isFlagEnabled('newQueryBuilder')) {
        _source = `import "regexp"\nimport "influxdata/influxdb/schema"`
        queryText = `${_source}
      schema.tagValues(
        bucket: "${bucket.name}",
        tag: "_measurement",
        predicate: (r) => true,
        start: ${CACHING_REQUIRED_START_DATE},
        stop: ${CACHING_REQUIRED_END_DATE},
      )
      |> limit(n: ${limit})
      |> sort()`
      }

      try {
        const resp = await queryAPI(queryText, scope)
        const values = (Object.values(resp.parsed.table.columns).filter(
          c => c.name === '_value' && c.type === 'string'
        )[0]?.data ?? []) as string[]
        setMeasurements(values)
      } catch (error) {
        console.error(error.message)
      }
    },
    [scope]
  )

  const handleSelectBucket = useCallback(
    (bucket: Bucket): void => {
      setSelectedBucket(bucket)

      // Reset measurement, tags, and fields
      // TODO: loading status for measurements
      setSelectedMeasurement('')
      setFields([])
      setTags([])

      // Get measurement values
      getMeasurements(bucket)
    },
    [getMeasurements]
  )

  const handleSelectMeasurement = (measurement: string): void => {
    setSelectedMeasurement(measurement)
    // TODO: get fields and tags from context
    setFields([])
    setTags([])
  }

  const handleSearchTerm = (searchTerm: string): void => {
    // TODO
    /* eslint-disable no-console */
    console.log('Search: ', searchTerm)
    /* eslint-disable no-console */
    setSearchTerm(searchTerm)
  }

  return useMemo(
    () => (
      <NewDataExplorerContext.Provider
        value={{
          // Schema
          selectedBucket,
          measurements,
          selectedMeasurement,
          fields,
          tags,
          searchTerm,
          selectBucket: handleSelectBucket,
          selectMeasurement: handleSelectMeasurement,
          setSearchTerm: handleSearchTerm,

          // Query building
          query,
          loading,
          updateQuery: setQuery,
        }}
      >
        {children}
      </NewDataExplorerContext.Provider>
    ),
    [
      // Schema
      selectedBucket,
      measurements,
      selectedMeasurement,
      fields,
      tags,
      searchTerm,
      handleSelectBucket,

      // Query building
      query,
      loading,
      children,
    ]
  )
}
