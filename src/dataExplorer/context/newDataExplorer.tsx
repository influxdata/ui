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

const LOCAL_LIMIT = 8
const INITIAL_FIELDS = []
const INITIAL_TAGS = []

interface NewDataExplorerContextType {
  // Schema
  selectedBucket: Bucket
  measurements: string[] // TODO: type MeasurementSchema?
  selectedMeasurement: string // TODO: type Measurement?
  fields: string[] // TODO: type Field[]?
  tags: any[]
  loadingTags: RemoteDataState
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
  loadingTags: RemoteDataState.NotStarted,
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

export interface Tag {
  key: string
  values: string[]
}

export const NewDataExplorerProvider: FC<Prop> = ({scope, children}) => {
  const [loading] = useState(RemoteDataState.NotStarted)
  const [loadingTags, setLoadingTags] = useState(RemoteDataState.NotStarted)
  const {query: queryAPI} = useContext(QueryContext)
  const [query, setQuery] = useState('')
  const [selectedBucket, setSelectedBucket] = useState(null)
  const [measurements, setMeasurements] = useState<Array<string>>([])
  const [selectedMeasurement, setSelectedMeasurement] = useState('')
  const [fields, setFields] = useState<Array<string>>(INITIAL_FIELDS)
  const [tags, setTags] = useState<Array<Tag>>(INITIAL_TAGS)
  const [searchTerm, setSearchTerm] = useState('')

  const limit = isFlagEnabled('increasedMeasurmentTagLimit')
    ? EXTENDED_TAG_LIMIT
    : DEFAULT_TAG_LIMIT

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

      // TODO: can we do hard coded time range here?
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
        /* eslint-disable no-console */
        // TODO: remove
        console.log('get measurements\n\n', queryText)
        console.log(values)
        /* eslint-disable no-console */
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

    // TODO: can we do hard coded time range here?
    let queryText = `${_source}
      |> range(start: -30d, stop: now())
      |> filter(fn: (r) => (r["_measurement"] == "${measurement}"))
      |> keep(columns: ["_field"])
      |> group()
      |> distinct(column: "_field")
      |> limit(n: ${limit})
      |> sort()
    `

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
          |> sort()
      `
    }

    try {
      const resp = await queryAPI(queryText, scope)
      const values = (Object.values(resp.parsed.table.columns).filter(
        c => c.name === '_value' && c.type === 'string'
      )[0]?.data ?? []) as string[]
      setFields(values)
      /* eslint-disable no-console */
      // TODO: remove
      console.log('get fields\n\n', queryText)
      console.log(values)
      /* eslint-disable no-console */
    } catch (e) {
      console.error(e.message)
    }
  }

  const getTagKeys = async (measurement: string) => {
    if (isEmpty(selectedBucket) || measurement === '') {
      return
    }

    let tags: Tag[] = []

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

    try {
      const resp = await queryAPI(queryText, scope)
      const keys = (Object.values(resp.parsed.table.columns).filter(
        c => c.name === '_value' && c.type === 'string'
      )[0]?.data ?? []) as string[]
      tags = keys.map(key => {
        return {key, values: []} as Tag
      })
      /* eslint-disable no-console */
      // TODO: remove
      console.log('get tag keys\n\n', queryText)
      console.log(tags)
      /* eslint-disable no-console */
      const tagKeys = {}
      for (const key of keys) {
        const values = await getTagValues(measurement, key)
        tagKeys[key] = values
      }
      // update the tag values into tags
      tags.map(tag => {
        tag.values = tagKeys[tag.key]
      })
      setTags(tags)
      setLoadingTags(RemoteDataState.Done)
    } catch (e) {
      console.error(
        `Failed to get tags for measurement: "${measurement}"\n`,
        e.message
      )
      setLoadingTags(RemoteDataState.Error)
    }
  }

  const getTagValues = async (measurement: string, tagKey: string) => {
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

    // TODO: can we do hard coded time range here?
    let queryText = `${_source}
      |> range(start: -30d, stop: now())
      |> filter(fn: (r) => (r["_measurement"] == "${measurement}"))
      |> keep(columns: ["${tagKey}"])
      |> group()
      |> distinct(column: "${tagKey}")
      |> limit(n: ${LOCAL_LIMIT})
      |> sort()
    `

    if (selectedBucket.type !== 'sample' && isFlagEnabled('newQueryBuilder')) {
      _source = `${IMPORT_REGEXP}${IMPORT_INFLUX_SCHEMA}`
      queryText = `${_source}
        schema.tagValues(
          bucket: "${selectedBucket.name}",
          tag: "${tagKey}",
          predicate: (r) => (r["_measurement"] == "${measurement}"),
          start: ${CACHING_REQUIRED_START_DATE},
          stop: ${CACHING_REQUIRED_END_DATE},
        )
        |> limit(n: ${LOCAL_LIMIT})
        |> sort()
      `
    }

    try {
      const resp = await queryAPI(queryText, scope)
      const values = (Object.values(resp.parsed.table.columns).filter(
        c => c.name === '_value' && c.type === 'string'
      )[0]?.data ?? []) as string[]
      console.log(`get tag value for [${tagKey}]\n\n`, queryText)
      console.log(values)
      return values
    } catch (e) {
      console.error(
        `Failed to get tag value for tag key: "${tagKey}"\n`,
        e.message
      )
      return []
    }
  }

  const handleSelectBucket = useCallback(
    (bucket: Bucket): void => {
      setSelectedBucket(bucket)

      // Reset measurement, tags, and fields
      // TODO: loading status for measurements
      setSelectedMeasurement('')
      setFields(INITIAL_FIELDS)
      setTags(INITIAL_TAGS)

      // Get measurement values
      getMeasurements(bucket)
    },
    [getMeasurements]
  )

  const handleSelectMeasurement = (measurement: string): void => {
    setSelectedMeasurement(measurement)

    // Reset fields and tags, update loading status
    setFields(INITIAL_FIELDS)
    setTags(INITIAL_TAGS)
    setLoadingTags(RemoteDataState.Loading)

    // Get fields and tags
    getFields(measurement)
    getTagKeys(measurement)
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
          loadingTags,
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
      loadingTags,
      searchTerm,
      handleSelectBucket,

      // Query building
      query,
      loading,
      children,
    ]
  )
}
