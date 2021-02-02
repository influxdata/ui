// Libraries
import React, {
  FC,
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'

// Contexts
import {PipeContext} from 'src/flows/context/pipe'
import {QueryContext} from 'src/flows/context/query'
import {FlowContext} from 'src/flows/context/flow.current'

import {formatTimeRangeArguments} from 'src/timeMachine/apis/queryBuilder'

import {
  RemoteDataState,
  BuilderTagsType,
  BuilderAggregateFunctionType,
} from 'src/types'

const DEFAULT_TAG_LIMIT = 200

interface APIResultArray<T> {
  search: string
  status: RemoteDataState
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
    search: '',
    status: RemoteDataState.NotStarted,
    selected: [],
    results: [],
  },
  values: {
    search: '',
    status: RemoteDataState.NotStarted,
    selected: [],
    results: [],
  },
  aggregateFunctionType: 'filter',
})

interface QueryBuilderContextType {
  cards: QueryBuilderCard[]
  add: () => void
  remove: (idx: number) => void
  update: (idx: number, card: Partial<QueryBuilderCard>) => void
  loadKeys: (_idx: number) => void
  loadValues: (_idx: number) => void
}

export const DEFAULT_CONTEXT: QueryBuilderContextType = {
  cards: [getDefaultCard()],
  add: () => {},
  remove: (_idx: number) => {},
  update: (_idx: number, _card: QueryBuilderCard) => {},
  loadKeys: (_idx: number) => {},
  loadValues: (_idx: number) => {},
}

export const QueryBuilderContext = createContext<QueryBuilderContextType>(
  DEFAULT_CONTEXT
)

const toBuilderConfig = (cards: QueryBuilderCard[]): BuilderTagsType[] =>
  cards.map(card => ({
    key: card.keys.selected[0],
    values: card.values.selected.slice(0),
    aggregateFunctionType: card.aggregateFunctionType,
  }))

const fromBuilderConfig = (tags: BuilderTagsType[]): QueryBuilderCard[] =>
  tags.map(tag => {
    const out = getDefaultCard()
    out.keys.selected = [tag.key]
    out.values.selected = [...tag.values]
    out.aggregateFunctionType = tag.aggregateFunctionType

    return out
  })

export const QueryBuilderProvider: FC = ({children}) => {
  const {data, update} = useContext(PipeContext)
  const {query} = useContext(QueryContext)
  const {flow} = useContext(FlowContext)

  const [cards, setCards] = useState(fromBuilderConfig(data.tags))

  useEffect(() => {
    setCards([getDefaultCard()])
  }, [data.buckets[0]])

  const add = useCallback(() => {
    cards.push(getDefaultCard())
    setCards(cards)

    update({tags: toBuilderConfig(cards)})
  }, [cards, setCards])

  const loadKeys = useCallback(
    idx => {
      const {buckets} = data

      if (!data.buckets[0] || !cards[idx]) {
        return
      }

      cards[idx].keys.status = RemoteDataState.Loading
      setCards(cards)

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
      const searchString = cards[idx].keys.search
        ? `\n  |> filter(fn: (r) => r._value =~ /(?i:${cards[idx].keys.search})/)`
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
              |> range(${formatTimeRangeArguments(flow.range)})
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

            setCards([...cards])
            update({tags: toBuilderConfig(cards)})
          } else if (!keys.includes(key)) {
            keys.unshift(key)
          }

          cards[idx].keys = {
            search: cards[idx].keys.search,
            status: RemoteDataState.Done,
            results: keys,
            selected: cards[idx].keys.selected,
          }
          cards[idx].values = {
            ...cards[idx].values,
            status: RemoteDataState.NotStarted,
          }

          setCards([...cards])
        })
    },
    [data.buckets, cards, setCards]
  )

  const loadValues = useCallback(
    idx => {
      cards[idx].values.status = RemoteDataState.Loading
      setCards(cards)

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
      const searchString = cards[idx].values.search
        ? `\n  |> filter(fn: (r) => r._value =~ /(?i:${cards[idx].values.search})/)`
        : ''

      // TODO: Use the `v1.tagValues` function from the Flux standard library once
      // this issue is resolved: https://github.com/influxdata/flux/issues/1071
      query(`from(bucket: "${data.buckets[0]}")
              |> range(${formatTimeRangeArguments(flow.range)})
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
          cards[idx].values = {
            search: cards[idx].values.search,
            status: RemoteDataState.Done,
            results: values,
            selected: cards[idx].values.selected,
          }

          setCards([...cards])
        })
    },
    [data.buckets, cards, setCards]
  )

  const remove = (idx: number): void => {
    if (idx === 0 || idx > cards.length) {
      return
    }

    cards.splice(idx, 1)
    const newCards = cards.map((card, i) => {
      if (i < idx) {
        return card
      }

      return {
        ...card,
        keys: {
          ...card.keys,
          status: RemoteDataState.NotStarted,
        },
        values: {
          ...card.values,
          status: RemoteDataState.NotStarted,
        },
      }
    })
    setCards(newCards)

    update({tags: toBuilderConfig(newCards)})
  }

  const updater = (idx: number, card: Partial<QueryBuilderCard>): void => {
    if (idx < 0 || idx > cards.length) {
      return
    }

    cards[idx] = {
      ...cards[idx],
      ...card,
    }
    setCards([...cards])

    update({tags: toBuilderConfig(cards)})
  }

  return (
    <QueryBuilderContext.Provider
      value={{
        cards,
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
