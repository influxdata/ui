// Libraries
import React, {SFC} from 'react'

// Components
import {List, ComponentSize} from '@influxdata/clockface'

interface Props {
  items: string[]
  selectedItems: string[]
  onSelectItem: (item: string) => void
  multiSelect: boolean
  children?: JSX.Element | JSX.Element[]
  testID?: string
  wrapText?: boolean
}

const SelectorList: SFC<Props> = props => {
  const {
    items,
    selectedItems,
    onSelectItem,
    multiSelect,
    children,
    testID,
    wrapText,
  } = props

  return (
    <List
      autoHideScrollbars={true}
      testID={testID}
      style={{flex: '1 0 0'}}
      scrollToSelected={true}
    >
      {items.map(item => {
        const selected = selectedItems.includes(item)

        const indicator = multiSelect && <List.Indicator type="checkbox" />

        return (
          <List.Item
            className="selector-list--item"
            testID={`selector-list ${item}`}
            key={item}
            value={item}
            onClick={onSelectItem}
            title={item}
            selected={selected}
            size={ComponentSize.ExtraSmall}
            wrapText={wrapText}
          >
            {indicator}
            {item}
          </List.Item>
        )
      })}
      {children}
    </List>
  )
}

export default SelectorList
