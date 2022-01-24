// Libraries
import React, {
  FC,
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react'

// Contexts
import {PipeContext} from 'src/flows/context/pipe'
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {BucketContext} from 'src/flows/context/bucket.scoped'

import {formatTimeRangeArguments} from 'src/timeMachine/apis/queryBuilder'

import {
  RemoteDataState,
  BuilderTagsType,
  BuilderAggregateFunctionType,
} from 'src/types'

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

  add: () => void
  remove: (idx: number) => void
  update: (idx: number, card: Partial<QueryBuilderCard>) => void
  loadKeys: (idx: number, search?: string) => void
  loadValues: (idx: number, search?: string) => void
}

export const DEFAULT_CONTEXT: QueryBuilderContextType = {
  cards: [getDefaultCard()],
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

  const [cardMeta, setCardMeta] = useState<QueryBuilderMeta[]>(
    Array(data.tags.length).fill({
      keys: [],
      values: [],
      loadingKeys: RemoteDataState.NotStarted,
      loadingValues: RemoteDataState.NotStarted,
    })
  )

  useEffect(() => {
    // Migrate old data
    if (typeof data.buckets[0] === 'string') {
      const buck = buckets.find(b => b.name === data.buckets[0])

      if (!buck) {
        update({
          buckets: [{type: 'user', name: data.buckets[0]}],
        })

        return
      }

      update({
        buckets: [buck],
      })

      return
    }

    if (data.tags.length) {
      return
    }

    const card = getDefaultCard()
    card.keys.selected = ['_measurement']
    update({tags: [card].map(toBuilderConfig)})
    setCardMeta([
      {
        keys: [],
        values: [],
        loadingKeys: RemoteDataState.NotStarted,
        loadingValues: RemoteDataState.NotStarted,
      },
    ])
  }, [data.buckets])

  const cards = useMemo(
    () => data.tags.map((tag, idx) => fromBuilderConfig(tag, cardMeta[idx])),
    [data.tags, cardMeta]
  )

  const add = useCallback(() => {
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
  }, [cards])

  const loadKeys = useCallback(
    (idx, search) => {
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
        ? `\n  |> filter(fn: (r) => r._value =~ /(?i:${search})/)`
        : ''
      const previousTagSelections = cards
        .slice(0, idx)
        .map(card => `r._value != "${card.keys.selected[0]}"`)
      const previousTagString = previousTagSelections.length
        ? `\n  |> filter(fn: (r) => ${previousTagSelections.join(' and ')})`
        : ''

      const {scope} = getPanelQueries(id)

      let _source
      if (data.buckets[0].type === 'sample') {
        _source = `import "influxdata/influxdb/sample"\nsample.data(set: "${data.buckets[0].id}")`
      } else {
        _source = `from(bucket: "${data.buckets[0].name}")`
      }

      // TODO: Use the `v1.tagKeys` function from the Flux standard library once
      // this issue is resolved: https://github.com/influxdata/flux/issues/1071
      query(
        `${_source}
              |> range(${formatTimeRangeArguments(range)})
              |> filter(fn: (r) => ${tagString})
              |> keys()
              |> keep(columns: ["_value"])
              |> distinct()${searchString}${previousTagString}
              |> filter(fn: (r) => r._value != "_time" and r._value != "_start" and r._value !=  "_stop" and r._value != "_value")
              |> sort()
              |> limit(n: ${EXTENDED_TAG_LIMIT})`,
        scope
      )
        .then(resp => {
          return (Object.values(resp.parsed.table.columns).filter(
            c => c.name === '_value' && c.type === 'string'
          )[0]?.data ?? []) as string[]
        })
        .then(keys => {
          if (!cards[idx].keys.selected[0]) {
            if (idx === 0 && keys.includes('_measurement')) {
              cards[idx].keys.selected = ['_measurement']
            } else {
              cards[idx].keys.selected = [keys[0]]
            }

            update({tags: cards.map(toBuilderConfig)})
          } else if (!keys.includes(cards[idx].keys.selected[0])) {
            keys.unshift(cards[idx].keys.selected[0])
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
    },
    [data.buckets, cards]
  )

  const loadValues = useCallback(
    (idx, search) => {
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
        ? `\n  |> filter(fn: (r) => r._value =~ /(?i:${search})/)`
        : ''

      const {scope} = getPanelQueries(id)
      let _source
      if (data.buckets[0].type === 'sample') {
        _source = `import "influxdata/influxdb/sample"\nsample.data(set: "${data.buckets[0].id}")`
      } else {
        _source = `from(bucket: "${data.buckets[0].name}")`
      }

      // TODO: Use the `v1.tagValues` function from the Flux standard library once
      // this issue is resolved: https://github.com/influxdata/flux/issues/1071
      query(
        `${_source}
              |> range(${formatTimeRangeArguments(range)})
              |> filter(fn: (r) => ${tagString})
              |> keep(columns: ["${cards[idx].keys.selected[0]}"])
              |> group()
              |> distinct(column: "${
                cards[idx].keys.selected[0]
              }")${searchString}
              |> limit(n: ${DEFAULT_TAG_LIMIT})
              |> sort()`,
        scope
      )
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
    },
    [data.buckets, cards]
  )

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
        loadValues,
      }}
    >
      {children}
    </QueryBuilderContext.Provider>
  )
}
