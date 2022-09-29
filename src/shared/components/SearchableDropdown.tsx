// Libraries
import React, {FC, ChangeEvent, CSSProperties, useState} from 'react'

// Components
import {
  Input,
  Dropdown,
  ComponentStatus,
  ComponentSize,
  DropdownMenuTheme,
  ComponentColor,
  IconFont,
} from '@influxdata/clockface'

interface Props {
  testID: string
  className?: string
  searchTerm?: string
  searchPlaceholder?: string
  selectedOption: string
  onSelect: (option: string) => void
  onChangeSearchTerm?: (value: string) => void
  buttonStatus: ComponentStatus
  buttonTestID: string
  menuTestID: string
  options: (string | number)[]
  emptyText: string
  style?: CSSProperties
}

const SearchableDropdown: FC<Props> = ({
  buttonStatus = ComponentStatus.Default,
  testID = 'searchable-dropdown',
  buttonTestID = 'searchable-dropdown--button',
  menuTestID = 'searchable-dropdown--menu',
  searchTerm = '',
  searchPlaceholder,
  selectedOption,
  className,
  style,
  options,
  onChangeSearchTerm,
  emptyText,
  onSelect,
}) => {
  const [isSearchActive, setIsSearchActive] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    onChangeSearchTerm(e.target.value)
  }

  const filteredOptions = options.filter(option =>
    `${option}`.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
  )

  let body: JSX.Element | JSX.Element[] = (
    <Dropdown.ItemEmpty>{emptyText}</Dropdown.ItemEmpty>
  )

  if (filteredOptions.length) {
    body = filteredOptions.map(option => (
      <Dropdown.Item
        key={option}
        value={option}
        selected={option === selectedOption}
        onClick={onSelect}
        testID={`searchable-dropdown--item ${option}`}
      >
        {option}
      </Dropdown.Item>
    ))
  }

  return (
    <Dropdown
      testID={testID}
      className={className}
      style={style}
      button={(active, onClick) => (
        <Dropdown.Button
          active={active}
          onClick={onClick}
          testID={buttonTestID}
          color={ComponentColor.Default}
          size={ComponentSize.Small}
          status={buttonStatus}
        >
          {buttonStatus === ComponentStatus.Loading
            ? 'Loading...'
            : selectedOption}
        </Dropdown.Button>
      )}
      menu={onCollapse => (
        <Dropdown.Menu
          onCollapse={() => {
            if (isSearchActive === false) {
              onCollapse()
            }
          }}
          theme={DropdownMenuTheme.Onyx}
          testID={menuTestID}
        >
          <div className="searchable-dropdown--input-container">
            <Input
              icon={IconFont.Search_New}
              onFocus={() => setIsSearchActive(true)}
              onChange={handleChange}
              onBlur={() => setIsSearchActive(false)}
              value={searchTerm}
              placeholder={searchPlaceholder}
              size={ComponentSize.Small}
              autoFocus={true}
            />
          </div>
          {body}
        </Dropdown.Menu>
      )}
    />
  )
}

export default SearchableDropdown
