// Libraries
import React, {FC, createContext, useContext, useState} from 'react'

// Contexts
import {PipeContext} from 'src/flows/context/pipe'
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {BucketContext} from 'src/flows/context/bucket.scoped'

import {formatTimeRangeArguments} from 'src/timeMachine/apis/queryBuilder'

import {isFlagEnabled} from 'src/shared/utils/featureFlag'

import {
  RemoteDataState,
  BuilderTagsType,
  BuilderAggregateFunctionType,
} from 'src/types'
import {
  CACHING_REQUIRED_END_DATE,
  CACHING_REQUIRED_START_DATE,
} from 'src/utils/datetime/constants'

const DEFAULT_TAG_LIMIT = 200
const EXTENDED_TAG_LIMIT = 500

interface APIResultArray<T> {
  selected: T[]
  results: T[]
  loading: RemoteDataState
}

interface QueryBuilderCard {
  keys: APIResultArray<string>
  values: APIResultArray<string>
  aggregateFunctionType: BuilderAggregateFunctionType
}

interface QueryBuilderMeta {
  keys: string[]
  values: string[]
  loadingKeys: RemoteDataState
  loadingValues: RemoteDataState
}

const getDefaultCard = (): QueryBuilderCard => ({
  keys: {
    selected: [],
    results: [],
    loading: RemoteDataState.NotStarted,
  },
  values: {
    selected: [],
    results: [],
    loading: RemoteDataState.NotStarted,
  },
  aggregateFunctionType: 'filter',
})

interface QueryBuilderContextType {
  cards: QueryBuilderCard[]

  selectBucket: (bucket?: string) => void
  selectMeasurement: (measurement?: string) => void

  add: () => void
  cancelKey: (idx: number) => void
  cancelValue: (idx: number) => void
  remove: (idx: number) => void
  update: (idx: number, card: Partial<QueryBuilderCard>) => void
  loadKeys: (idx: number, search?: string) => void | Promise<any>
  loadValues: (idx: number, search?: string) => void | Promise<any>
}

export const DEFAULT_CONTEXT: QueryBuilderContextType = {
  cards: [getDefaultCard()],

  selectBucket: _ => {},
  selectMeasurement: _ => {},

  add: () => {},
  cancelKey: (_idx: number) => {},
  cancelValue: (_idx: number) => {},
  remove: (_idx: number) => {},
  update: (_idx: number, _card: QueryBuilderCard) => {},
  loadKeys: (_idx: number, _search?: string) => {},
  loadValues: (_idx: number, _search?: string) => {},
}

export const QueryBuilderContext = createContext<QueryBuilderContextType>(
  DEFAULT_CONTEXT
)

const toBuilderConfig = (card: QueryBuilderCard): BuilderTagsType => ({
  key: (card.keys.selected || [])[0],
  values: (card.values.selected || []).slice(0),
  aggregateFunctionType: card.aggregateFunctionType,
})

const fromBuilderConfig = (
  tag: BuilderTagsType,
  meta?: QueryBuilderMeta
): QueryBuilderCard => {
  const out = getDefaultCard()

  out.keys.selected = [tag.key]
  out.keys.results = meta?.keys ?? []
  out.keys.loading = meta?.loadingKeys ?? RemoteDataState.NotStarted
  out.values.selected = [...tag.values]
  out.values.results = meta?.values ?? []
  out.values.loading = meta?.loadingValues ?? RemoteDataState.NotStarted
  out.aggregateFunctionType = tag.aggregateFunctionType

  return out
}

export const QueryBuilderProvider: FC = ({children}) => {
  const {id, data, range, update} = useContext(PipeContext)
  const {query, getPanelQueries} = useContext(FlowQueryContext)
  const {buckets} = useContext(BucketContext)
  const [cancelKey, setCancelKey] = useState({})
  const [cancelValue, setCancelValue] = useState({})

  const [cardMeta, setCardMeta] = useState<QueryBuilderMeta[]>(
    Array(data.tags.length).fill({
      keys: [],
      values: [],
      loadingKeys: RemoteDataState.NotStarted,
      loadingValues: RemoteDataState.NotStarted,
    })
  )

  const selectBucket = (bucket?: string) => {
    const card = getDefaultCard()

    if (!bucket || bucket === data?.buckets[0]?.name) {
      update({buckets: [], tags: [card].map(toBuilderConfig)})
    } else {
      card.keys.selected = ['_measurement']
      update({
        buckets: [buckets.find(b => b.name === bucket)],
        tags: [card].map(toBuilderConfig),
      })
    }

    setCardMeta([
      {
        keys: [],
        values: [],
        loadingKeys: RemoteDataState.NotStarted,
        loadingValues: RemoteDataState.NotStarted,
      },
    ])
  }

  const selectMeasurement = (measurement?: string) => {
    if (measurement) {
      update({
        tags: [
          {
            ...data.tags[0],
            values: [measurement],
          },
          toBuilderConfig(getDefaultCard()),
        ],
      })

      setCardMeta([
        cardMeta[0],
        {
          keys: [],
          values: [],
          loadingKeys: RemoteDataState.NotStarted,
          loadingValues: RemoteDataState.NotStarted,
        },
      ])
    } else {
      update({
        tags: [
          {
            ...data.tags[0],
            values: [],
          },
        ],
      })

      setCardMeta([cardMeta[0]])
    }
  }

  const cards = data.tags.map((tag, idx) =>
    fromBuilderConfig(tag, cardMeta[idx])
  )

  const add = () => {
    cards.push(getDefaultCard())

    setCardMeta([
      ...cardMeta,
      {
        keys: [],
        values: [],
        loadingKeys: RemoteDataState.NotStarted,
        loadingValues: RemoteDataState.NotStarted,
      },
    ])

    update({tags: cards.map(toBuilderConfig)})
  }

  const loadKeys = (idx, search) => {
    if (
      !data.buckets[0] ||
      typeof data.buckets[0] === 'string' ||
      !cards[idx]
    ) {
      return
    }

    if (!cardMeta[idx]) {
      return
    }

    if (cardMeta[idx].loadingKeys === RemoteDataState.Loading) {
      return
    }

    cardMeta.splice(idx, 1, {
      ...cardMeta[idx],
      loadingKeys: RemoteDataState.Loading,
    })
    setCardMeta([...cardMeta])

    const tagSelections = cards
      .filter(card => card.keys.selected[0] && card.values.selected.length)
      .map(card => {
        const fluxTags = card.values.selected
          .map(
            value =>
              `r["${card.keys.selected[0]}"] == "${value.replace(
                /\\/g,
                '\\\\'
              )}"`
          )
          .join(' or ')

        return `(${fluxTags})`
      })
    const tagString = tagSelections.length
      ? tagSelections.join(' and ')
      : 'true'
    const searchString = search
      ? `\n  |> filter(fn: (r) => r._value =~ regexp.compile(v: "(?i:" + regexp.quoteMeta(v: "${search}") + ")"))`
      : ''
    const previousTagSelections = cards
      .slice(0, idx)
      .map(card => `r._value != "${card.keys.selected[0]}"`)
    const previousTagString = previousTagSelections.length
      ? `\n  |> filter(fn: (r) => ${previousTagSelections.join(' and ')})`
      : ''

    const {scope} = getPanelQueries(id)

    let _source = 'import "regexp"\n'
    if (data.buckets[0].type === 'sample') {
      _source += `import "influxdata/influxdb/sample"\nsample.data(set: "${data.buckets[0].id}")`
    } else {
      _source += `from(bucket: "${data.buckets[0].name}")`
    }

    const limit = isFlagEnabled('increasedMeasurmentTagLimit')
      ? EXTENDED_TAG_LIMIT
      : DEFAULT_TAG_LIMIT

    let queryText = `${_source}
    |> range(${formatTimeRangeArguments(range)})
    |> filter(fn: (r) => ${tagString})
    |> keys()
    |> keep(columns: ["_value"])
    |> distinct()${searchString}${previousTagString}
    |> filter(fn: (r) => r._value != "_time" and r._value != "_start" and r._value !=  "_stop" and r._value != "_value")
    |> sort()
    |> limit(n: ${limit})`

    if (
      data.buckets[0].type !== 'sample' &&
      isFlagEnabled('queryBuilderUseMetadataCaching')
    ) {
      _source = `import "regexp"
      import "influxdata/influxdb/schema"`
      queryText = `${_source}
  schema.tagKeys(
    bucket: "${data.buckets[0].name}",
    predicate: (r) => ${tagString},
    start: ${CACHING_REQUIRED_START_DATE},
    stop: ${CACHING_REQUIRED_END_DATE},
  )${searchString}${previousTagString}
    |> filter(fn: (r) => r._value != "_time" and r._value != "_start" and r._value !=  "_stop" and r._value != "_value")
    |> sort()
    |> limit(n: ${limit})`
    }

    const result = query(queryText, scope)

    setCancelKey(prev => ({
      ...prev,
      [idx]: (result as any).cancel,
    }))

    return result
      .then(resp => {
        return (Object.values(resp.parsed.table.columns).filter(
          c => c.name === '_value' && c.type === 'string'
        )[0]?.data ?? []) as string[]
      })
      .then(keys => {
        const currentCards = data.tags.map(fromBuilderConfig)
        if (!currentCards[idx].keys.selected[0]) {
          if (idx === 0 && keys.includes('_measurement')) {
            currentCards[idx].keys.selected = ['_measurement']
          } else {
            currentCards[idx].keys.selected = [keys[0]]
          }

          update({tags: currentCards.map(toBuilderConfig)})
        } else if (!keys.includes(currentCards[idx].keys.selected[0])) {
          keys.unshift(currentCards[idx].keys.selected[0])
        }

        cardMeta.splice(idx, 1, {
          keys,
          values: [],
          loadingKeys: RemoteDataState.Done,
          loadingValues: RemoteDataState.NotStarted,
        })
        setCardMeta([...cardMeta])
      })
      .catch(e => {
        console.error(e)
      })
  }

  const handleCancelKey = idx => {
    if (idx in cancelKey) {
      cancelKey[idx]()
    }
  }

  const handleCancelValue = idx => {
    if (idx in cancelValue) {
      cancelValue[idx]()
    }
  }

  const loadValues = (idx, search) => {
    if (
      cardMeta[idx].loadingValues === RemoteDataState.Loading ||
      !data.buckets.length
    ) {
      return
    }

    cardMeta.splice(idx, 1, {
      ...cardMeta[idx],
      loadingValues: RemoteDataState.Loading,
    })

    setCardMeta([...cardMeta])

    const tagSelections = cards
      .slice(0, idx)
      .filter(card => card.keys.selected[0] && card.values.selected.length)
      .map(card => {
        const fluxTags = card.values.selected
          .map(
            value =>
              `r["${card.keys.selected[0]}"] == "${value.replace(
                /\\/g,
                '\\\\'
              )}"`
          )
          .join(' or ')

        return `(${fluxTags})`
      })
    const tagString = tagSelections.length
      ? tagSelections.join(' and ')
      : 'true'
    const searchString = search
      ? `\n  |> filter(fn: (r) => r._value =~ regexp.compile(v: "(?i:" + regexp.quoteMeta(v: "${search}") + ")"))`
      : ''

    const {scope} = getPanelQueries(id)
    let _source = 'import "regexp"\n'
    if (data.buckets[0].type === 'sample') {
      _source += `import "influxdata/influxdb/sample"\nsample.data(set: "${data.buckets[0].id}")`
    } else {
      _source += `from(bucket: "${data.buckets[0].name}")`
    }

    const limit = isFlagEnabled('increasedMeasurmentTagLimit')
      ? EXTENDED_TAG_LIMIT
      : DEFAULT_TAG_LIMIT
    let queryText = `${_source}
    |> range(${formatTimeRangeArguments(range)})
    |> filter(fn: (r) => ${tagString})
    |> keep(columns: ["${cards[idx].keys.selected[0]}"])
    |> group()
    |> distinct(column: "${cards[idx].keys.selected[0]}")${searchString}
    |> limit(n: ${limit})
    |> sort()`

    if (
      data.buckets[0].type !== 'sample' &&
      isFlagEnabled('queryBuilderUseMetadataCaching')
    ) {
      _source = `import "regexp"
      import "influxdata/influxdb/schema"`
      queryText = `${_source}
  schema.tagValues(
    bucket: "${data.buckets[0].name}",
    tag: "${cards[idx].keys.selected[0]}",
    predicate: (r) => ${tagString},
    start: ${CACHING_REQUIRED_START_DATE},
    stop: ${CACHING_REQUIRED_END_DATE},
  )${searchString}
  |> limit(n: ${limit})
  |> sort()`
    }

    const result = query(queryText, scope)

    setCancelValue(prev => ({
      ...prev,
      [idx]: (result as any).cancel,
    }))

    return result
      .then(resp => {
        return (Object.values(resp.parsed.table.columns).filter(
          c => c.name === '_value' && c.type === 'string'
        )[0]?.data ?? []) as string[]
      })
      .then(values => {
        cardMeta.splice(idx, 1, {
          ...cardMeta[idx],
          values,
          loadingValues: RemoteDataState.Done,
        })
        setCardMeta([...cardMeta])
      })
      .catch(e => {
        console.error(e)
      })
  }

  const remove = (idx: number): void => {
    if (idx === 0 || idx > cards.length) {
      return
    }

    cards.splice(idx, 1)
    cardMeta.splice(idx, 1)

    setCardMeta(
      cardMeta.map((meta, i) => {
        if (i < idx) {
          return meta
        }

        return {
          keys: [],
          values: [],
          loadingKeys: RemoteDataState.NotStarted,
          loadingValues: RemoteDataState.NotStarted,
        }
      })
    )

    update({tags: cards.map(toBuilderConfig)})
  }

  const updater = (idx: number, card: Partial<QueryBuilderCard>): void => {
    if (idx < 0 || idx > data.tags.length) {
      return
    }

    const _card = {
      ...cards[idx],
      ...card,

      keys: {
        ...cards[idx].keys,
        ...(card.keys || {}),
      },
      values: {
        ...cards[idx].values,
        ...(card.values || {}),
      },
    }

    if (_card.keys?.selected[0] !== cards[idx]?.keys?.selected[0]) {
      cardMeta.splice(idx, 1, {
        ...cardMeta[idx],
        values: [],
        loadingValues: RemoteDataState.NotStarted,
      })
      setCardMeta([...cardMeta])
    }

    cards[idx] = {
      ...cards[idx],
      ..._card,
    }

    data.tags = cards.map(toBuilderConfig)

    update({tags: data.tags})
  }

  return (
    <QueryBuilderContext.Provider
      value={{
        cards,

        selectBucket,
        selectMeasurement,
        cancelKey: handleCancelKey,
        cancelValue: handleCancelValue,
        add,
        remove,
        update: updater,
        loadKeys,
        loadValues,
      }}
    >
      {children}
    </QueryBuilderContext.Provider>
  )
}
