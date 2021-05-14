// Libraries
import React, {
  FC,
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react'

// Contexts
import {PipeContext} from 'src/flows/context/pipe'
import {QueryContext} from 'src/flows/context/query'

import {formatTimeRangeArguments} from 'src/timeMachine/apis/queryBuilder'

import {
  RemoteDataState,
  BuilderTagsType,
  BuilderAggregateFunctionType,
} from 'src/types'

const DEFAULT_TAG_LIMIT = 200

interface APIResultArray<T> {
  selected: T[]
  results: T[]
}

interface QueryBuilderCard {
  keys: APIResultArray<string>
  values: APIResultArray<string>
  aggregateFunctionType: BuilderAggregateFunctionType
}

const getDefaultCard = (): QueryBuilderCard => ({
  keys: {
    selected: [],
    results: [],
  },
  values: {
    selected: [],
    results: [],
  },
  aggregateFunctionType: 'filter',
})

interface QueryBuilderContextType {
  cards: QueryBuilderCard[]
  keyLoading: RemoteDataState[]
  valueLoading: RemoteDataState[]

  add: () => void
  remove: (idx: number) => void
  update: (idx: number, card: Partial<QueryBuilderCard>) => void
  loadKeys: (idx: number, search?: string) => void
  loadValues: (idx: number, search?: string) => void
}

export const DEFAULT_CONTEXT: QueryBuilderContextType = {
  cards: [getDefaultCard()],
  keyLoading: [RemoteDataState.NotStarted],
  valueLoading: [RemoteDataState.NotStarted],
  add: () => {},
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
  keys?: string[],
  values?: string[]
): QueryBuilderCard => {
  const out = getDefaultCard()

  out.keys.selected = [tag.key]
  out.keys.results = keys || []
  out.values.selected = [...tag.values]
  out.values.results = values || []
  out.aggregateFunctionType = tag.aggregateFunctionType

  return out
}

export const QueryBuilderProvider: FC = ({children}) => {
  const {data, range, update} = useContext(PipeContext)
  const {query} = useContext(QueryContext)

  const [keyResults, setKeyResults] = useState(Array(data.tags.length).fill([]))
  const [keyLoading, setKeyLoading] = useState(
    Array(data.tags.length).fill(RemoteDataState.NotStarted)
  )
  const [valueResults, setValueResults] = useState(
    Array(data.tags.length).fill([])
  )
  const [valueLoading, setValueLoading] = useState(
    Array(data.tags.length).fill(RemoteDataState.Loading)
  )
  const cards = useMemo(
    () =>
      data.tags.map((tag, idx) =>
        fromBuilderConfig(tag, keyResults[idx], valueResults[idx])
      ),
    [data.tags, keyResults, valueResults]
  )

  const add = useCallback(() => {
    cards.push(getDefaultCard())
    keyResults.push([])
    keyLoading.push(RemoteDataState.NotStarted)
    valueResults.push([])
    valueLoading.push(RemoteDataState.NotStarted)

    update({tags: cards.map(toBuilderConfig)})
    setKeyResults([...keyResults])
    setKeyLoading([...keyLoading])
    setValueResults([...valueResults])
    setValueLoading([...valueLoading])
  }, [cards])

  const loadKeys = useCallback(
    (idx, search) => {
      const {buckets} = data

      if (!data.buckets[0] || !cards[idx]) {
        return
      }

      keyLoading[idx] = RemoteDataState.Loading
      setKeyLoading([...keyLoading])

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
        ? `\n  |> filter(fn: (r) => r._value =~ /(?i:${search})/)`
        : ''
      const previousTagSelections = cards
        .slice(0, idx)
        .map(card => `r._value != "${card.keys.selected[0]}"`)
      const previousTagString = previousTagSelections.length
        ? `\n  |> filter(fn: (r) => ${previousTagSelections.join(' and ')})`
        : ''

      // TODO: Use the `v1.tagKeys` function from the Flux standard library once
      // this issue is resolved: https://github.com/influxdata/flux/issues/1071
      query(`from(bucket: "${buckets[0]}")
              |> range(${formatTimeRangeArguments(range)})
              |> filter(fn: (r) => ${tagString})
              |> keys()
              |> keep(columns: ["_value"])
              |> distinct()${searchString}${previousTagString}
              |> filter(fn: (r) => r._value != "_time" and r._value != "_start" and r._value !=  "_stop" and r._value != "_value")
              |> sort()
              |> limit(n: ${DEFAULT_TAG_LIMIT})`)
        .then(resp => {
          return resp.parsed.table.getColumn('_value', 'string') || []
        })
        .then(keys => {
          const key = cards[idx].keys.selected[0]

          if (!key) {
            if (idx === 0 && keys.includes('_measurement')) {
              cards[idx].keys.selected = ['_measurement']
            } else {
              cards[idx].keys.selected = [keys[0]]
            }

            update({tags: cards.map(toBuilderConfig)})
          } else if (!keys.includes(key)) {
            keys.unshift(key)
          }

          keyResults[idx] = keys
          setKeyResults([...keyResults])

          keyLoading[idx] = RemoteDataState.Done
          setKeyLoading([...keyLoading])

          valueLoading[idx] = RemoteDataState.NotStarted
          setValueLoading([...valueLoading])
        })
    },
    [data.buckets, cards]
  )

  const loadValues = useCallback(
    (idx, search) => {
      if (valueLoading[idx] === RemoteDataState.Loading) {
        return
      }
      valueLoading[idx] = RemoteDataState.Loading
      setValueLoading([...valueLoading])

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
        ? `\n  |> filter(fn: (r) => r._value =~ /(?i:${search})/)`
        : ''

      // TODO: Use the `v1.tagValues` function from the Flux standard library once
      // this issue is resolved: https://github.com/influxdata/flux/issues/1071
      query(`from(bucket: "${data.buckets[0]}")
              |> range(${formatTimeRangeArguments(range)})
              |> filter(fn: (r) => ${tagString})
              |> keep(columns: ["${cards[idx].keys.selected[0]}"])
              |> group()
              |> distinct(column: "${
                cards[idx].keys.selected[0]
              }")${searchString}
              |> limit(n: ${DEFAULT_TAG_LIMIT})
              |> sort()`)
        .then(resp => {
          return resp.parsed.table.getColumn('_value', 'string') || []
        })
        .then(values => {
          valueLoading[idx] = RemoteDataState.Done
          setValueLoading([...valueLoading])

          valueResults[idx] = values
          setValueResults([...valueResults])
        })
    },
    [data.buckets, cards]
  )

  const remove = (idx: number): void => {
    if (idx === 0 || idx > cards.length) {
      return
    }

    cards.splice(idx, 1)
    update({tags: cards.map(toBuilderConfig)})
    setKeyLoading(
      keyLoading.map((loading, i) => {
        if (i < idx) {
          return loading
        }

        return RemoteDataState.NotStarted
      })
    )
    setValueLoading(
      valueLoading.map((loading, i) => {
        if (i < idx) {
          return loading
        }

        return RemoteDataState.NotStarted
      })
    )
  }

  const updater = (idx: number, card: Partial<QueryBuilderCard>): void => {
    if (idx < 0 || idx > data.tags.length) {
      return
    }

    if (card.keys?.selected[0] !== cards[idx]?.keys?.selected[0]) {
      valueLoading[idx] = RemoteDataState.NotStarted
      setValueLoading([...valueLoading])
    }

    cards[idx] = {
      ...cards[idx],
      ...card,
    }
    update({tags: cards.map(toBuilderConfig)})
  }

  return (
    <QueryBuilderContext.Provider
      value={{
        cards,
        add,
        remove,
        update: updater,
        loadKeys,
        keyLoading,
        loadValues,
        valueLoading,
      }}
    >
      {children}
    </QueryBuilderContext.Provider>
  )
}
