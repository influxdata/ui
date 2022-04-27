// Libraries
import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Input,
  AlignItems,
  ComponentSize,
  FlexDirection,
  FlexBox,
} from '@influxdata/clockface'

// Contexts
import {QueryBuilderContext} from 'src/flows/pipes/QueryBuilder/context'
import {PipeContext} from 'src/flows/context/pipe'

// Utils
import {toComponentStatus} from 'src/shared/utils/toComponentStatus'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Types
import {RemoteDataState, BuilderAggregateFunctionType} from 'src/types'

// Components
import SearchableDropdown from 'src/shared/components/SearchableDropdown'
import TagSelectorCount from 'src/shared/components/TagSelectorCount'
import WaitingText from 'src/shared/components/WaitingText'
import BuilderCard from 'src/timeMachine/components/builderCard/BuilderCard'
import SelectorList from 'src/timeMachine/components/SelectorList'

import {event} from 'src/cloud/utils/reporting'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

const DEBOUNCE_TIMEOUT = 500
const debounce_array = []
type NOOP = () => void
const debouncer = (idx: number, action: NOOP): void => {
  if (debounce_array[idx]) {
    clearTimeout(debounce_array[idx])
  }

  debounce_array[idx] = setTimeout(() => {
    action()
    delete debounce_array[idx]
  }, DEBOUNCE_TIMEOUT)
}

interface Props {
  idx: number
}

const Card: FC<Props> = ({idx}) => {
  const {
    cards,
    selectMeasurement,
    add,
    cancelKey,
    cancelValue,
    update,
    remove,
    loadKeys,
    loadValues,
  } = useContext(QueryBuilderContext)
  const {data} = useContext(PipeContext)
  const card = cards[idx]
  const [keySearches, setKeySearches] = useState([])
  const [valueSearches, setValueSearches] = useState([])

  const allItems = useMemo(() => {
    const results = new Set(card?.values?.results)
    const selected = card?.values?.selected?.filter(s => !results.has(s))

    return [...selected, ...Array.from(results)]
  }, [card?.values?.selected, card?.values?.results])

  const _remove =
    idx !== 0 &&
    (() => {
      event('Query Builder Card Removed')
      remove(idx)
    })

  const _update = (fnType: BuilderAggregateFunctionType): void => {
    update(idx, {
      aggregateFunctionType: fnType.toLowerCase() as BuilderAggregateFunctionType,
    })
  }

  const keySearch = useCallback(
    (search: string) => {
      keySearches[idx] = search
      setKeySearches([...keySearches])
      debouncer(idx, () => {
        loadKeys(idx, search)
      })
    },
    [loadKeys, card.keys, idx]
  )

  const keySelect = val => {
    if (card.keys.selected[0] === val) {
      return
    }
    event('Query Builder key selected')
    update(idx, {
      keys: {
        ...card.keys,
        selected: [val],
      },
    })
  }

  const valueSearch = (search: string) => {
    valueSearches[idx] = search
    setValueSearches([...valueSearches])
    debouncer(idx, () => {
      loadValues(idx, search)
    })
  }

  const isCompliant =
    isFlagEnabled('newQueryBuilder') &&
    idx === 0 &&
    (card.keys.selected.length === 0 ||
      (card.keys.selected.length === 1 &&
        card.keys.selected[0] === '_measurement')) &&
    card.aggregateFunctionType !== 'group' &&
    card.values.selected.length <= 1

  const valueSelect = val => {
    const index = card.values.selected.indexOf(val)

    if (isCompliant) {
      if (index === -1) {
        event('Query Builder Value Selected')
        selectMeasurement(val)
      } else {
        event('Query Builder Value Unselected')
        selectMeasurement(null)
      }

      return
    }

    if (index === -1) {
      event('Query Builder Value Selected')
      card.values.selected.push(val)
    } else {
      event('Query Builder Value Unselected')
      card.values.selected.splice(index, 1)
    }

    update(idx, card)

    if (
      index === -1 &&
      card.values.selected.length === 1 &&
      idx === cards.length - 1
    ) {
      add()
    } else {
      for (let ni = idx + 1; ni < cards.length; ni++) {
        loadKeys(ni)
      }
    }
  }

  useEffect(() => {
    let promise
    if (data.buckets[0] && card.keys.loading === RemoteDataState.NotStarted) {
      promise = loadKeys(idx)
      if (promise instanceof Promise) {
        promise.finally(() => {
          promise = null
        })
      }
    }

    return () => {
      cancelKey(idx)
    }
  }, [data.buckets, card.keys.loading])

  useEffect(() => {
    let promise
    if (
      card.keys.loading === RemoteDataState.Done &&
      card.values.loading !== RemoteDataState.Done
    ) {
      promise = loadValues(idx)

      if (promise instanceof Promise) {
        promise.finally(() => {
          promise = null
        })
      }
    }

    return () => {
      cancelValue(idx)
    }
  }, [card.keys.loading, card.values.loading])

  if (card.keys.loading === RemoteDataState.NotStarted) {
    let emptyText = 'Select a value first'

    if (idx === 0) {
      emptyText = 'Select a bucket first'
    }

    return (
      <BuilderCard>
        <BuilderCard.Empty>{emptyText}</BuilderCard.Empty>
      </BuilderCard>
    )
  }

  if (card.keys.loading === RemoteDataState.Error) {
    return (
      <BuilderCard>
        <BuilderCard.Empty>Failed to load tag keys</BuilderCard.Empty>
      </BuilderCard>
    )
  }

  if (card.keys.loading === RemoteDataState.Done && !card.keys.results.length) {
    return (
      <BuilderCard>
        <BuilderCard.Empty testID="empty-tag-keys">
          No tag keys found <small>in the current time range</small>
        </BuilderCard.Empty>
      </BuilderCard>
    )
  }

  let _values

  if (card.values.loading === RemoteDataState.Error) {
    _values = (
      <BuilderCard.Empty>
        {`Failed to load tag values for ${card.keys.selected[0]}`}
      </BuilderCard.Empty>
    )
  } else if (
    card.values.loading === RemoteDataState.Loading ||
    card.values.loading === RemoteDataState.NotStarted
  ) {
    _values = (
      <BuilderCard.Empty>
        <WaitingText text="Loading tag values" />
      </BuilderCard.Empty>
    )
  } else if (card.values.loading === RemoteDataState.Done && !allItems.length) {
    _values = (
      <BuilderCard.Empty>
        No values found <small>in the current time range</small>
      </BuilderCard.Empty>
    )
  } else {
    _values = (
      <SelectorList
        items={allItems}
        selectedItems={card.values.selected}
        onSelectItem={valueSelect}
        multiSelect={!isCompliant}
      />
    )
  }

  if (card.aggregateFunctionType === 'group') {
    return (
      <BuilderCard>
        <BuilderCard.DropdownHeader
          options={['filter', 'group'].map(s => s.toUpperCase())}
          selectedOption={card.aggregateFunctionType.toUpperCase()}
          onDelete={_remove}
          onSelect={_update}
        />
        <BuilderCard.Menu>
          <Input
            value={valueSearches[idx] || ''}
            placeholder={`Search ${card.keys.selected[0]} tag values`}
            className="tag-selector--search"
            onChange={evt => {
              valueSearch(evt.target.value)
            }}
            onClear={() => valueSearch('')}
          />
        </BuilderCard.Menu>
        {_values}
      </BuilderCard>
    )
  }

  return (
    <BuilderCard>
      {!isCompliant && (
        <BuilderCard.DropdownHeader
          options={['filter', 'group'].map(s => s.toUpperCase())}
          selectedOption={card.aggregateFunctionType.toUpperCase()}
          onDelete={_remove}
          onSelect={_update}
        />
      )}
      {isCompliant && <BuilderCard.Header title="Measurement" />}
      <BuilderCard.Menu>
        {!isCompliant && (
          <FlexBox
            direction={FlexDirection.Row}
            alignItems={AlignItems.Center}
            margin={ComponentSize.Small}
          >
            <ErrorBoundary>
              <SearchableDropdown
                searchTerm={keySearches[idx] || ''}
                emptyText="No Tags Found"
                searchPlaceholder="Search keys..."
                selectedOption={card.keys.selected[0]}
                onSelect={keySelect}
                buttonStatus={toComponentStatus(card.keys.loading)}
                onChangeSearchTerm={keySearch}
                testID="tag-selector--dropdown"
                buttonTestID="tag-selector--dropdown-button"
                menuTestID="tag-selector--dropdown-menu"
                options={card.keys.results}
              />
            </ErrorBoundary>
            {!!card?.values?.selected?.length && (
              <TagSelectorCount count={card.values.selected.length} />
            )}
          </FlexBox>
        )}
        <Input
          value={valueSearches[idx] || ''}
          placeholder={`Search ${card.keys.selected[0]} tag values`}
          className="tag-selector--search"
          onChange={evt => {
            valueSearch(evt.target.value)
          }}
          onClear={() => valueSearch('')}
        />
      </BuilderCard.Menu>
      {_values}
    </BuilderCard>
  )
}

const CardList: FC = () => {
  const {cards} = useContext(QueryBuilderContext)

  if (!cards.length) {
    return null
  }

  return (
    <>
      {cards.map((_card, idx) => (
        <Card key={idx} idx={idx} />
      ))}
    </>
  )
}

export default CardList
