import React, {FC, useCallback, useContext, useEffect, useState} from 'react'
import {
  Input,
  AlignItems,
  ComponentSize,
  FlexDirection,
  FlexBox,
} from '@influxdata/clockface'

import {QueryBuilderContext} from 'src/flows/pipes/QueryBuilder/context'
import {PipeContext} from 'src/flows/context/pipe'

import {toComponentStatus} from 'src/shared/utils/toComponentStatus'
import {RemoteDataState, BuilderAggregateFunctionType} from 'src/types'
import SearchableDropdown from 'src/shared/components/SearchableDropdown'
import BuilderCard from 'src/timeMachine/components/builderCard/BuilderCard'
import SelectorList from 'src/timeMachine/components/SelectorList'
import WaitingText from 'src/shared/components/WaitingText'

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
  const {cards, add, update, remove, loadKeys, loadValues} = useContext(
    QueryBuilderContext
  )
  const {data} = useContext(PipeContext)
  const card = cards[idx]
  const [keySearches, setKeySearches] = useState([])
  const [valueSearches, setValueSearches] = useState([])

  const _remove =
    idx !== 0 &&
    (() => {
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

  const valueSelect = val => {
    const _vals = [...card.values.selected]
    const index = _vals.indexOf(val)

    if (index === -1) {
      _vals.push(val)
    } else {
      _vals.splice(index, 1)
    }
    update(idx, {
      values: {
        ...card.values,
        selected: _vals,
      },
    })

    if (index === -1 && _vals.length === 1 && idx === cards.length - 1) {
      add()
    } else {
      for (let ni = idx + 1; ni < cards.length; ni++) {
        loadKeys(ni)
      }
    }
  }

  useEffect(() => {
    if (data.buckets[0] && card.keys.loading === RemoteDataState.NotStarted) {
      loadKeys(idx)
    }
  }, [data.buckets, card.keys.loading])

  useEffect(() => {
    if (
      card.keys.loading === RemoteDataState.Done &&
      card.values.loading !== RemoteDataState.Done
    ) {
      loadValues(idx)
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
  } else if (
    card.values.loading === RemoteDataState.Done &&
    !card.values.results.length
  ) {
    _values = (
      <BuilderCard.Empty>
        No values found <small>in the current time range</small>
      </BuilderCard.Empty>
    )
  } else {
    _values = (
      <SelectorList
        items={card.values.results}
        selectedItems={card.values.selected}
        onSelectItem={valueSelect}
        multiSelect
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
      <BuilderCard.DropdownHeader
        options={['filter', 'group'].map(s => s.toUpperCase())}
        selectedOption={card.aggregateFunctionType.toUpperCase()}
        onDelete={_remove}
        onSelect={_update}
      />
      <BuilderCard.Menu>
        <FlexBox
          direction={FlexDirection.Row}
          alignItems={AlignItems.Center}
          margin={ComponentSize.Small}
        >
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
        </FlexBox>
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
