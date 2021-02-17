import React, {FC, useContext, useEffect} from 'react'
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

  const keySearch = (search: string) => {
    update(idx, {
      keys: {
        ...card.keys,
        search,
      },
    })

    debouncer(idx, () => {
      loadKeys(idx)
    })
  }

  const keySelect = val => {
    update(idx, {
      keys: {
        ...card.keys,
        selected: [val],
      },
      values: {
        ...card.values,
        status: RemoteDataState.NotStarted,
      },
    })
  }

  const valueSearch = (search: string) => {
    update(idx, {
      values: {
        ...card.values,
        search,
      },
    })

    debouncer(idx, () => {
      loadValues(idx)
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
    if (data.buckets[0] && card.keys.status === RemoteDataState.NotStarted) {
      loadKeys(idx)
    }
  }, [data.buckets, card.keys.status])

  useEffect(() => {
    if (
      card.keys.status === RemoteDataState.Done &&
      card.values.status === RemoteDataState.NotStarted
    ) {
      loadValues(idx)
    }
  }, [card.keys.status, card.values.status])

  if (card.keys.status === RemoteDataState.NotStarted) {
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

  if (card.keys.status === RemoteDataState.Error) {
    return (
      <BuilderCard>
        <BuilderCard.Empty>Failed to load tag keys</BuilderCard.Empty>
      </BuilderCard>
    )
  }

  if (card.keys.status === RemoteDataState.Done && !card.keys.results.length) {
    return (
      <BuilderCard>
        <BuilderCard.Empty testID="empty-tag-keys">
          No tag keys found <small>in the current time range</small>
        </BuilderCard.Empty>
      </BuilderCard>
    )
  }

  let _values

  if (card.values.status === RemoteDataState.Error) {
    _values = (
      <BuilderCard.Empty>
        {`Failed to load tag values for ${card.keys.selected[0]}`}
      </BuilderCard.Empty>
    )
  } else if (
    card.values.status === RemoteDataState.Loading ||
    card.values.status === RemoteDataState.NotStarted
  ) {
    _values = (
      <BuilderCard.Empty>
        <WaitingText text="Loading tag values" />
      </BuilderCard.Empty>
    )
  } else if (
    card.values.status === RemoteDataState.Done &&
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
            value={card.values.search}
            placeholder={`Search ${card.keys.selected[0]} tag values`}
            className="tag-selector--search"
            onChange={evt => {
              valueSearch(evt.target.value)
            }}
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
            searchTerm={card.keys.search}
            emptyText="No Tags Found"
            searchPlaceholder="Search keys..."
            selectedOption={card.keys.selected[0]}
            onSelect={keySelect}
            buttonStatus={toComponentStatus(card.keys.status)}
            onChangeSearchTerm={keySearch}
            testID="tag-selector--dropdown"
            buttonTestID="tag-selector--dropdown-button"
            menuTestID="tag-selector--dropdown-menu"
            options={card.keys.results}
          />
        </FlexBox>
        <Input
          value={card.values.search}
          placeholder={`Search ${card.keys.selected[0]} tag values`}
          className="tag-selector--search"
          onChange={evt => {
            valueSearch(evt.target.value)
          }}
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
