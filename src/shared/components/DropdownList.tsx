// Libraries
import React, {FC} from 'react'

// Components
import {Dropdown, DropdownItemType} from '@influxdata/clockface'

interface Props {
  items: string[]
  selectedItems: string[]
  onSelectItem: (item: string) => void
  multiSelect: boolean
  testID?: string
  wrapText?: boolean
  disabled?: boolean
}

const DropdownList: FC<Props> = props => {
  const {
    items,
    selectedItems,
    onSelectItem,
    multiSelect,
    testID,
    wrapText,
    disabled,
  } = props

  const selectionType = multiSelect
    ? DropdownItemType.Checkbox
    : DropdownItemType.Dot

  return (
    <Dropdown
      testID={testID}
      style={{flex: '1 0 0'}}
      button={(active, onClick) => (
        <Dropdown.Button
          active={active}
          onClick={onClick}
          testID="selector-list--dropdown-button"
        >
          {selectedItems.join(',')}
        </Dropdown.Button>
      )}
      menu={onCollapse => (
        <Dropdown.Menu onCollapse={onCollapse}>
          {items.map(item => {
            const selected = selectedItems.includes(item)
            return (
              <Dropdown.Item
                className="selector-list--item"
                testID={`selector-list ${item}`}
                key={item}
                value={item}
                onClick={onSelectItem}
                title={item}
                selected={selected}
                wrapText={wrapText}
                disabled={disabled}
                type={selectionType}
              >
                {item}
              </Dropdown.Item>
            )
          })}
        </Dropdown.Menu>
      )}
    />
  )
}

export {DropdownList}
