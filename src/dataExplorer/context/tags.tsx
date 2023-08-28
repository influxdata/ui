// Libraries
import React, {createContext, FC, useContext, useMemo, useState} from 'react'
import {Bucket, RemoteDataState} from 'src/types'
import {useSelector} from 'react-redux'

// Constants
import {
  CACHING_REQUIRED_END_DATE,
  CACHING_REQUIRED_START_DATE,
} from 'src/utils/datetime/constants'
import {DEFAULT_LIMIT} from 'src/shared/constants/queryBuilder'
import {LanguageType} from 'src/dataExplorer/components/resources'

// Contexts
import {QueryContext, QueryOptions, QueryScope} from 'src/shared/contexts/query'
import {ResultsViewContext} from 'src/dataExplorer/context/resultsView'

// Utils
import {
  IMPORT_REGEXP,
  IMPORT_STRINGS,
  IMPORT_INFLUX_SCHEMA,
  SAMPLE_DATA_SET,
  SEARCH_STRING,
  sanitizeSQLSearchTerm,
} from 'src/dataExplorer/shared/utils'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Selectors
import {isOrgIOx} from 'src/organizations/selectors'

interface TagsContextType {
  tags: Tags
  loadingTagKeys: RemoteDataState
  loadingTagValues: Hash<RemoteDataState>
  getTagKeys: (bucket: Bucket, measurement: string, searchTerm?: string) => void
  getTagValues: (bucket: Bucket, measurement: string, tagKey: string) => void
  resetTags: () => void
}

const DEFAULT_CONTEXT: TagsContextType = {
  tags: {} as Tags,
  loadingTagKeys: RemoteDataState.NotStarted,
  loadingTagValues: {} as Hash<RemoteDataState>,
  getTagKeys: (_b: Bucket, _m: string, _s: string) => {},
  getTagValues: (_b: Bucket, _m: string, _tk: string) => {},
  resetTags: () => {},
}

export const TagsContext = createContext<TagsContextType>(DEFAULT_CONTEXT)

const INITIAL_TAGS = {} as Tags
const INITIAL_LOADING_TAG_VALUES = {} as Hash<RemoteDataState>

interface Hash<T> {
  [key: string]: T
}

type Tags = Record<string, string[] | number[] | boolean[]>

interface Prop {
  scope: QueryScope
}

export const TagsProvider: FC<Prop> = ({children, scope}) => {
  const isIOx = useSelector(isOrgIOx)

  // Contexts
  const {query: queryAPI} = useContext(QueryContext)
  const {setDefaultViewOptions} = useContext(ResultsViewContext)

  // States
  const [tags, setTags] = useState<Tags>(
    JSON.parse(JSON.stringify(INITIAL_TAGS))
  )
  const [loadingTagKeys, setLoadingTagKeys] = useState<RemoteDataState>(
    RemoteDataState.NotStarted
  )
  const [loadingTagValues, setLoadingTagValues] = useState<
    Hash<RemoteDataState>
  >(INITIAL_LOADING_TAG_VALUES)

  const getTagKeys = async (
    bucket: Bucket,
    measurement: string,
    searchTerm?: string
  ) => {
    if (!bucket || !measurement) {
      return
    }

    setLoadingTagKeys(RemoteDataState.Loading)

    if (isFlagEnabled('v2privateQueryUI') && isIOx) {
      // user input is sanitized to avoid SQL injection
      const sanitized = sanitizeSQLSearchTerm(searchTerm)
      const queryTextSQL: string = `
        SELECT column_name
        FROM information_schema.columns
        WHERE
            table_schema = 'iox'
            AND data_type LIKE 'Dictionary%'
            AND table_name = '${measurement}'
            AND column_name ILIKE '%${sanitized}%'
        LIMIT ${DEFAULT_LIMIT}
      `
      const newTags: Tags = {}
      try {
        const resp = await queryAPI(queryTextSQL, scope, {
          language: LanguageType.SQL,
          bucket,
        } as QueryOptions)
        const keys = (resp.parsed.table.columns?.column_name?.data ??
          []) as string[]

        const tagValueStatuses = {} as Hash<RemoteDataState>
        keys.map(key => {
          // Initialize tags with keys
          newTags[key] = []
          // Initialize status for each key
          tagValueStatuses[key] = RemoteDataState.NotStarted
        })

        setTags(newTags)
        setLoadingTagKeys(RemoteDataState.Done)
        setLoadingTagValues(tagValueStatuses)
        setDefaultViewOptions({groupby: Object.keys(newTags)})
      } catch (e) {
        console.error(
          `Failed to get tags for measurement: "${measurement}"\n`,
          e.message
        )
        setLoadingTagKeys(RemoteDataState.Error)
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
      |> keys()
      |> keep(columns: ["_value"])
      |> distinct()
      ${searchTerm ? SEARCH_STRING(searchTerm) : ''}
      |> filter(fn: (r) => r._value != "_measurement" and r._value != "_field")
      |> filter(fn: (r) => r._value != "_time" and r._value != "_start" and r._value !=  "_stop" and r._value != "_value")
      |> sort()
      |> limit(n: ${DEFAULT_LIMIT})
    `
        : `${IMPORT_REGEXP}${IMPORT_INFLUX_SCHEMA}${IMPORT_STRINGS}
      schema.measurementTagKeys(
        bucket: "${bucket.name}",
        measurement: "${measurement}",
        start: ${CACHING_REQUIRED_START_DATE},
        stop: ${CACHING_REQUIRED_END_DATE},
      )
      |> filter(fn: (r) => r._value != "_measurement" and r._value != "_field")
      |> filter(fn: (r) => r._value != "_start" and r._value != "_stop")
      ${searchTerm ? SEARCH_STRING(searchTerm) : ''}
      |> map(fn: (r) => ({r with lowercase: strings.toLower(v: r._value)}))
      |> sort(columns: ["lowercase"])
      |> limit(n: ${DEFAULT_LIMIT})
    `

    const newTags: Tags = {}
    try {
      const resp = await queryAPI(queryText, scope)
      const keys = (Object.values(resp.parsed.table.columns).filter(
        c => c.name === '_value' && c.type === 'string'
      )[0]?.data ?? []) as string[]

      const tagValueStatuses = {} as Hash<RemoteDataState>
      keys.map(key => {
        // Initialize tags with keys
        newTags[key] = []
        // Initialize status for each key
        tagValueStatuses[key] = RemoteDataState.NotStarted
      })

      setTags(newTags)
      setLoadingTagKeys(RemoteDataState.Done)
      setLoadingTagValues(tagValueStatuses)
      setDefaultViewOptions({groupby: Object.keys(newTags)})
    } catch (e) {
      console.error(
        `Failed to get tags for measurement: "${measurement}"\n`,
        e.message
      )
      setLoadingTagKeys(RemoteDataState.Error)
    }
  }

  const getTagValues = async (
    bucket: Bucket,
    measurement: string,
    tagKey: string
  ) => {
    if (!bucket || !measurement) {
      return
    }

    setLoadingTagValues({
      ...loadingTagValues,
      [tagKey]: RemoteDataState.Loading,
    })

    if (isFlagEnabled('v2privateQueryUI') && isIOx) {
      const queryTextSQL: string = `
        SELECT DISTINCT("${tagKey}")
        FROM "${measurement}"
        ORDER BY "${tagKey}"
        LIMIT ${DEFAULT_LIMIT}
      `
      try {
        const resp = await queryAPI(queryTextSQL, scope, {
          language: LanguageType.SQL, // use SQL to get measurement list
          bucket,
        } as QueryOptions)
        const values =
          Object.values(resp.parsed.table?.columns ?? [])[0]?.data ?? []

        // Update the tag key with the corresponding tag values
        const newTags = {...tags, [tagKey]: values}
        setTags(newTags)
        setLoadingTagValues({
          ...loadingTagValues,
          [tagKey]: RemoteDataState.Done,
        })
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
      return
    }

    // Simplified version of query from this file:
    //   src/flows/pipes/QueryBuilder/context.tsx
    const queryText =
      bucket.type === 'sample'
        ? `${SAMPLE_DATA_SET(bucket.id)}
      |> range(start: -100y, stop: now())
      |> filter(fn: (r) => (r["_measurement"] == "${measurement}"))
      |> keep(columns: ["${tagKey}"])
      |> group()
      |> distinct(column: "${tagKey}")
      |> sort()
      |> limit(n: ${DEFAULT_LIMIT})
    `
        : `${IMPORT_STRINGS}${IMPORT_INFLUX_SCHEMA}
      schema.measurementTagValues(
        bucket: "${bucket.name}",
        measurement: "${measurement}",
        tag: "${tagKey}",
        start: ${CACHING_REQUIRED_START_DATE},
        stop: ${CACHING_REQUIRED_END_DATE},
      )
      |> map(fn: (r) => ({r with lowercase: strings.toLower(v: r._value)}))
      |> sort(columns: ["lowercase"])
      |> limit(n: ${DEFAULT_LIMIT})
    `

    try {
      const resp = await queryAPI(queryText, scope)
      const values =
        Object.values(resp.parsed.table.columns).filter(
          c => c.name === '_value' && c.type === 'string'
        )[0]?.data ?? []

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

  const resetTags = () => {
    setTags(JSON.parse(JSON.stringify(INITIAL_TAGS)))
    setLoadingTagKeys(RemoteDataState.NotStarted)
    setLoadingTagValues(INITIAL_LOADING_TAG_VALUES)
  }

  return useMemo(
    () => (
      <TagsContext.Provider
        value={{
          tags,
          loadingTagKeys,
          loadingTagValues,
          getTagKeys,
          getTagValues,
          resetTags,
        }}
      >
        {children}
      </TagsContext.Provider>
    ),
    [tags, loadingTagKeys, loadingTagValues]
  )
}
