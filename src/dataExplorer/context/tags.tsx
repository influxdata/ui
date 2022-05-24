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
} from 'src/dataExplorer/context/newDataExplorer'
import {QueryContext} from 'src/shared/contexts/query'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

interface TagsContextType {
  tags: Tags
  loadingTagKeys: RemoteDataState
  loadingTagValues: Hash<RemoteDataState>
  getTagKeys: (bucket: any, measurement: string) => void
  getTagValues: (bucket: any, measurement: string, tagKey: string) => void
  resetTags: () => void
}

const DEFAULT_CONTEXT: TagsContextType = {
  tags: {} as Tags,
  loadingTagKeys: RemoteDataState.NotStarted,
  loadingTagValues: {} as Hash<RemoteDataState>,
  getTagKeys: (_b: any, _m: string) => {},
  getTagValues: (_b: any, _m: string, _tk: string) => {},
  resetTags: () => {},
}

export const TagsContext = createContext<TagsContextType>(DEFAULT_CONTEXT)

const INITIAL_TAGS = {} as Tags
const INITIAL_LOADING_TAG_VALUES = {} as Hash<RemoteDataState>

interface Hash<T> {
  [key: string]: T
}

type Tags = Record<string, string[]>

interface Prop {
  scope: QueryScope
}

export const TagsProvider: FC<Prop> = ({children, scope}) => {
  // Contexts
  const {query: queryAPI} = useContext(QueryContext)

  // States
  const [tags, setTags] = useState<Tags>(INITIAL_TAGS)
  const [loadingTagKeys, setLoadingTagKeys] = useState<RemoteDataState>(
    RemoteDataState.NotStarted
  )
  const [loadingTagValues, setLoadingTagValues] = useState<
    Hash<RemoteDataState>
  >(INITIAL_LOADING_TAG_VALUES)

  // Constant
  const limit = isFlagEnabled('increasedMeasurmentTagLimit')
    ? EXTENDED_TAG_LIMIT
    : DEFAULT_TAG_LIMIT

  const getTagKeys = async (bucket: any, measurement: string) => {
    if (!bucket || !measurement) {
      return
    }

    setLoadingTagKeys(RemoteDataState.Loading)

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
        |> keys()
        |> keep(columns: ["_value"])
        |> distinct()
        |> filter(fn: (r) => r._value != "_measurement" and r._value != "_field")
        |> filter(fn: (r) => r._value != "_time" and r._value != "_start" and r._value !=  "_stop" and r._value != "_value")
        |> limit(n: ${limit})
        |> sort()
      `

    if (bucket.type !== 'sample' && isFlagEnabled('newQueryBuilder')) {
      _source = `${IMPORT_REGEXP}${IMPORT_INFLUX_SCHEMA}`
      queryText = `${_source}
          schema.tagKeys(
            bucket: "${bucket.name}",
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

    const newTags: Tags = {}
    try {
      const resp = await queryAPI(queryText, scope)
      const keys = (Object.values(resp.parsed.table.columns).filter(
        c => c.name === '_value' && c.type === 'string'
      )[0]?.data ?? []) as string[]

      // Initialize tags with keys
      keys.map(key => {
        newTags[key] = []
      })

      // Initialize status for each key
      const tagValueStatuses = {} as Hash<RemoteDataState>
      keys.map(key => {
        tagValueStatuses[key] = RemoteDataState.NotStarted
      })

      setTags(newTags)
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

  const getTagValues = async (
    bucket: any,
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
      |> filter(fn: (r) => (r["_measurement"] == "${measurement}"))
      |> keep(columns: ["${tagKey}"])
      |> group()
      |> distinct(column: "${tagKey}")
      |> limit(n: ${limit})
      |> sort()
    `

    if (bucket.type !== 'sample' && isFlagEnabled('newQueryBuilder')) {
      _source = `${IMPORT_REGEXP}${IMPORT_INFLUX_SCHEMA}`
      queryText = `${_source}
        schema.tagValues(
          bucket: "${bucket.name}",
          tag: "${tagKey}",
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
    setTags(INITIAL_TAGS)
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
