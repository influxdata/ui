import React, {FC, useState, useMemo} from 'react'

import {
  EmptyState,
  ComponentSize,
  DapperScrollbars,
} from '@influxdata/clockface'
import {SearchWidget} from 'src/shared/components/search_widget/SearchWidget'

type Item = Record<string, any>

interface Props {
  placeholder: string
  emptyMessage: string
  extractor: (i: Item) => string
  items: Item[]
  renderItem: (i: Item) => JSX.Element
  listHeader?: () => JSX.Element
  setEventSearchTerm?: (searchTerm: string) => void
}

export const FilterList: FC<Props> = ({
  extractor,
  items,
  placeholder,
  emptyMessage,
  renderItem,
  listHeader,
  setEventSearchTerm,
}) => {
  const [search, setSearch] = useState('')

  const onSearch = searchTerm => {
    if (setEventSearchTerm) {
      setEventSearchTerm(searchTerm)
    }
    setSearch(searchTerm)
  }
  const list = useMemo(() => {
    const filtered = items.filter(i =>
      extractor(i).toLowerCase().includes(search.toLowerCase())
    )

    if (!filtered.length) {
      return (
        <EmptyState size={ComponentSize.ExtraSmall}>
          <EmptyState.Text>{emptyMessage}</EmptyState.Text>
        </EmptyState>
      )
    } else {
      return (
        <>
          {filtered.map((item, idx) => (
            <div key={idx}>{renderItem(item)}</div>
          ))}
        </>
      )
    }
  }, [search, items, renderItem])

  return useMemo(
    () => (
      <div className="flux-toolbar">
        <div className="flux-toolbar--search">
          <SearchWidget
            placeholderText={placeholder}
            onSearch={onSearch}
            searchTerm={search}
            testID="flux-toolbar-search--input"
          />
        </div>
        {!!listHeader && listHeader()}
        <div className="flux-toolbar--list" data-testid="flux-toolbar--list">
          <DapperScrollbars>{list}</DapperScrollbars>
        </div>
      </div>
    ),
    [list, setSearch]
  )
}
