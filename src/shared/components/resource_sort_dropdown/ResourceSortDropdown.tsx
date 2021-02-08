// Libraries
import React from 'react'

// Components
import {Dropdown} from '@influxdata/clockface'

// Utilities
import {generateSortItems} from 'src/shared/components/resource_sort_dropdown/generateSortItems'

// Types
import {Sort} from '@influxdata/clockface'
import {
  SortKey,
  SortDropdownItem,
} from 'src/shared/components/resource_sort_dropdown/generateSortItems'
import {SortTypes} from 'src/shared/utils/sort'
import {ResourceType} from 'src/types'

interface ComponentProps {
  resourceType: ResourceType
  sortDirection: Sort
  sortKey: SortKey
  sortType: SortTypes
  onSelect: (sortKey: SortKey, sortDirection: Sort, sortType: SortTypes) => void
  width?: number
}

function ResourceSortDropdown({
  sortDirection,
  sortKey,
  sortType,
  onSelect,
  resourceType,
  width = 210,
}: ComponentProps) {
  const sortDropdownItems = generateSortItems(resourceType)

  const {label} = sortDropdownItems.find(
    item =>
      item.sortKey === sortKey &&
      item.sortDirection === sortDirection &&
      item.sortType === sortType
  )

  const handleItemClick = (item: SortDropdownItem): void => {
    const {sortKey, sortDirection, sortType} = item
    onSelect(sortKey, sortDirection, sortType)
  }

  const button = (active, onClick) => (
    <Dropdown.Button
      onClick={onClick}
      active={active}
      testID="resource-sorter--button"
    >
      {`Sort by ${label}`}
    </Dropdown.Button>
  )

  const menu = onCollapse => (
    <Dropdown.Menu onCollapse={onCollapse}>
      {sortDropdownItems.map(item => (
        <Dropdown.Item
          key={`${item.sortKey}${item.sortDirection}`}
          value={item}
          onClick={handleItemClick}
          testID={`resource-sorter--${item.sortKey}-${item.sortDirection}`}
          selected={
            item.sortKey === sortKey &&
            item.sortType === sortType &&
            item.sortDirection === sortDirection
          }
        >
          {item.label}
        </Dropdown.Item>
      ))}
    </Dropdown.Menu>
  )

  return (
    <Dropdown
      button={button}
      menu={menu}
      style={{flexBasis: `${width}px`, width: `${width}px`}}
      testID="resource-sorter"
    />
  )
}

export default ResourceSortDropdown
