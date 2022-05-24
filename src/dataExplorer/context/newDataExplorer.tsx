import React, {FC, createContext, useState, useMemo, useContext} from 'react'

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
import {MeasurementContext} from 'src/dataExplorer/context/measurements'
import {FieldContext} from 'src/dataExplorer/context/fields'

// Types
import {Bucket, QueryScope, RemoteDataState} from 'src/types'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

export const IMPORT_REGEXP = 'import "regexp"\n'
export const IMPORT_INFLUX_SCHEMA = 'import "influxdata/influxdb/schema"'
export const SAMPLE_DATA_SET = (bucketID: string) =>
  `import "influxdata/influxdb/sample"\nsample.data(set: "${bucketID}")`
export const FROM_BUCKET = (bucketName: string) =>
  `from(bucket: "${bucketName}")`

export const LOCAL_LIMIT = 8
const INITIAL_TAGS = {} as Tags
const INITIAL_LOADING_TAG_VALUES = {} as Hash<RemoteDataState>

interface Hash<T> {
  [key: string]: T
}

export type Tags = Record<string, string[]>

interface NewDataExplorerContextType {
  // Schema
  selectedBucket: Bucket
  selectedMeasurement: string
  tags: Tags
  loadingTagKeys: RemoteDataState
  loadingTagValues: Hash<RemoteDataState>
  searchTerm: string // for searching fields and tags
  selectBucket: (bucket: Bucket) => void
  selectMeasurement: (measurement: string) => void
  fetchTagValues: (tagKey: string) => void
  setSearchTerm: (str: string) => void

  // Query building
  query: string
  updateQuery: (q: string) => void
}

const DEFAULT_CONTEXT: NewDataExplorerContextType = {
  // Schema
  selectedBucket: null,
  selectedMeasurement: '',
  tags: {},
  loadingTagKeys: RemoteDataState.NotStarted,
  loadingTagValues: {} as Hash<RemoteDataState>,
  searchTerm: '',
  selectBucket: (_b: Bucket) => {},
  selectMeasurement: (_m: string) => {},
  fetchTagValues: (_tk: string) => {},
  setSearchTerm: (_s: string) => {},

  // Query building
  query: '',
  updateQuery: _q => {},
}

export const NewDataExplorerContext = createContext<NewDataExplorerContextType>(
  DEFAULT_CONTEXT
)

interface Prop {
  scope: QueryScope
}

export const NewDataExplorerProvider: FC<Prop> = ({scope, children}) => {
  // Contexts
  const {query: queryAPI} = useContext(QueryContext)
  const {getMeasurements} = useContext(MeasurementContext)
  const {getFields, resetFields} = useContext(FieldContext)

  // States
  const [selectedBucket, setSelectedBucket] = useState(null)
  const [selectedMeasurement, setSelectedMeasurement] = useState('')
  const [tags, setTags] = useState<Tags>(INITIAL_TAGS)
  const [loadingTagKeys, setLoadingTagKeys] = useState(
    RemoteDataState.NotStarted
  )
  const [loadingTagValues, setLoadingTagValues] = useState(
    INITIAL_LOADING_TAG_VALUES
  )
  const [query, setQuery] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Constants
  const limit = isFlagEnabled('increasedMeasurmentTagLimit')
    ? EXTENDED_TAG_LIMIT
    : DEFAULT_TAG_LIMIT

  const getTagKeys = async (measurement: string) => {
    if (!selectedBucket || !measurement) {
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

    // TODO: can we do hard coded time range here?
    let queryText = `${_source}
      |> range(start: -30d, stop: now())
      |> filter(fn: (r) => true)
      |> keys()
      |> keep(columns: ["_value"])
      |> distinct()
      |> filter(fn: (r) => r._value != "_measurement" and r._value != "_field")
      |> filter(fn: (r) => r._value != "_time" and r._value != "_start" and r._value !=  "_stop" and r._value != "_value")
      |> limit(n: ${limit})
      |> sort()
    `

    if (selectedBucket.type !== 'sample' && isFlagEnabled('newQueryBuilder')) {
      _source = `${IMPORT_REGEXP}${IMPORT_INFLUX_SCHEMA}`
      queryText = `${_source}
        schema.tagKeys(
          bucket: "${selectedBucket.name}",
          predicate: (r) => true,
          start: ${CACHING_REQUIRED_START_DATE},
          stop: ${CACHING_REQUIRED_END_DATE},
          )
          |> filter(fn: (r) => r._value != "_measurement" and r._value != "_field")
          |> filter(fn: (r) => r._value != "_time" and r._value != "_start" and r._value != "_stop" and r._value != "_value")
          |> limit(n: ${limit})
          |> sort()
      `
    }

    const tags: Tags = {}
    try {
      const resp = await queryAPI(queryText, scope)
      const keys = (Object.values(resp.parsed.table.columns).filter(
        c => c.name === '_value' && c.type === 'string'
      )[0]?.data ?? []) as string[]

      // Initialize tags with keys
      keys.map(key => {
        tags[key] = []
      })

      // Initialize status for each key
      const tagValueStatuses = {} as Hash<RemoteDataState>
      keys.map(key => {
        tagValueStatuses[key] = RemoteDataState.NotStarted
      })

      setTags(tags)
      setLoadingTagKeys(RemoteDataState.Done)
      setLoadingTagValues(tagValueStatuses)
    } catch (e) {
      console.error(
        `Failed to get tags for measurement: "${measurement}"\n`,
        e.message
      )
      setLoadingTagKeys(RemoteDataState.Error)
    }
  }

  const getTagValues = async (tagKey: string) => {
    if (!selectedBucket || !selectedMeasurement) {
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

    // TODO: can we do hard coded time range here?
    let queryText = `${_source}
      |> range(start: -30d, stop: now())
      |> filter(fn: (r) => (r["_measurement"] == "${selectedMeasurement}"))
      |> keep(columns: ["${tagKey}"])
      |> group()
      |> distinct(column: "${tagKey}")
      |> limit(n: ${limit})
      |> sort()
    `

    if (selectedBucket.type !== 'sample' && isFlagEnabled('newQueryBuilder')) {
      _source = `${IMPORT_REGEXP}${IMPORT_INFLUX_SCHEMA}`
      queryText = `${_source}
        schema.tagValues(
          bucket: "${selectedBucket.name}",
          tag: "${tagKey}",
          predicate: (r) => (r["_measurement"] == "${selectedMeasurement}"),
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

      // Update the tag key with the corresponding tag values
      const newTags = {...tags, [tagKey]: values}
      setTags(newTags)
      setLoadingTagValues({...loadingTagValues, [tagKey]: RemoteDataState.Done})
    } catch (e) {
      console.error(
        `Failed to get tag value for tag key: "${tagKey}"\n`,
        e.message
      )
      setLoadingTagValues({
        ...loadingTagValues,
        [tagKey]: RemoteDataState.Error,
      })
    }
  }

  const handleSelectBucket = (bucket: Bucket): void => {
    setSelectedBucket(bucket)

    // Reset measurement, tags, and fields
    setSelectedMeasurement('')
    resetFields()
    setTags(INITIAL_TAGS)

    // Get measurement values
    getMeasurements(bucket)
  }

  const handleSelectMeasurement = (measurement: string): void => {
    setSelectedMeasurement(measurement)

    // Reset fields and tags, update loading status
    resetFields()
    setTags(INITIAL_TAGS)
    setLoadingTagKeys(RemoteDataState.Loading)

    // Get fields and tags
    getFields(selectedBucket, measurement)
    getTagKeys(measurement)
  }

  const handleFetchTagValues = (tagKey: string): void => {
    setLoadingTagValues({
      ...loadingTagValues,
      [tagKey]: RemoteDataState.Loading,
    })
    getTagValues(tagKey)
  }

  const handleSearchTerm = (searchTerm: string): void => {
    // TODO: handle search
    //  Need to confirm with the product team what the scope of search
    //  e.g. field values? (and/or) tag keys? (and/or) tag values?

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
          selectedMeasurement,
          tags,
          loadingTagKeys,
          loadingTagValues,
          searchTerm,
          selectBucket: handleSelectBucket,
          selectMeasurement: handleSelectMeasurement,
          fetchTagValues: handleFetchTagValues,
          setSearchTerm: handleSearchTerm,

          // Query building
          query,
          updateQuery: setQuery,
        }}
      >
        {children}
      </NewDataExplorerContext.Provider>
    ),
    [
      // Schema
      selectedBucket,
      selectedMeasurement,
      tags,
      loadingTagKeys,
      loadingTagValues,
      searchTerm,

      // Query building
      query,
      children,
    ]
  )
}
