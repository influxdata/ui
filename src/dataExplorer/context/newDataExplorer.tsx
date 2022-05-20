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
import {Bucket, QueryScope, RemoteDataState} from 'src/types'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

const IMPORT_REGEXP = 'import "regexp"\n'
const IMPORT_INFLUX_SCHEMA = 'import "influxdata/influxdb/schema"'
const SAMPLE_DATA_SET = (bucketID: string) =>
  `import "influxdata/influxdb/sample"\nsample.data(set: "${bucketID}")`
const FROM_BUCKET = (bucketName: string) => `from(bucket: "${bucketName}")`

interface NewDataExplorerContextType {
  // Schema
  selectedBucket: Bucket
  measurements: string[] // TODO: type MeasurementSchema?
  selectedMeasurement: string // TODO: type Measurement?
  fields: string[] // TODO: type Field[]?
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
  const [fields, setFields] = useState<Array<string>>([])
  const [tags, setTags] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const getMeasurements = useCallback(
    async bucket => {
      if (isEmpty(bucket)) {
        return
      }

      // Simplified version of query from this file:
      //   src/flows/pipes/QueryBuilder/context.tsx
      let _source = IMPORT_REGEXP
      if (bucket.type === 'sample') {
        _source += SAMPLE_DATA_SET(bucket.id)
      } else {
        _source += FROM_BUCKET(bucket.name)
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
            |> sort()`
      }

      try {
        const resp = await queryAPI(queryText, scope)
        const values = (Object.values(resp.parsed.table.columns).filter(
          c => c.name === '_value' && c.type === 'string'
        )[0]?.data ?? []) as string[]
        setMeasurements(values)
      } catch (e) {
        console.error(e.message)
      }
    },
    [scope]
  )

  const getFields = async (measurement: string) => {
    if (isEmpty(selectedBucket) || measurement === '') {
      return
    }
    // Simplified version of query from this file:
    //   src/flows/pipes/QueryBuilder/context.tsx
    let _source = IMPORT_REGEXP
    if (selectedBucket.type === 'sample') {
      _source += SAMPLE_DATA_SET(selectedBucket.id)
    } else {
      _source += FROM_BUCKET(selectedBucket.name)
    }

    const limit = isFlagEnabled('increasedMeasurmentTagLimit')
      ? EXTENDED_TAG_LIMIT
      : DEFAULT_TAG_LIMIT

    // TODO: can we do hard coded time range here?
    let queryText = `${_source}
      |> range(start: -30d, stop: now())
      |> filter(fn: (r) => (r["_measurement"] == "${measurement}"))
      |> keep(columns: ["_field"])
      |> group()
      |> distinct(column: "_field")
      |> limit(n: ${limit})
      |> sort()`

    if (selectedBucket.type !== 'sample' && isFlagEnabled('newQueryBuilder')) {
      _source = `${IMPORT_REGEXP}${IMPORT_INFLUX_SCHEMA}`
      queryText = `${_source}
        schema.tagValues(
          bucket: "${selectedBucket.name}",
          tag: "_field",
          predicate: (r) => (r["_measurement"] == "${measurement}"),
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
      setFields(values)
    } catch (e) {
      console.error(e.message)
    }
  }

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
    // TODO: Reset fields and tags, add loading status
    getFields(measurement)
    // TODO: get tags from context
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
