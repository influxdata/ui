import React, {ChangeEvent} from 'react'
import {Dropdown, Input} from '@influxdata/clockface'
import {FixedSizeList as List} from 'react-window'
import classnames from 'classnames'
import {TypeAheadMenuItem} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown'

// Utils
import {multiOrgEvent} from 'src/identity/events/multiOrgEvent'
import {TypeAheadEventPrefix} from 'src/identity/events/multiOrgEventNames'

type Props = {
  defaultSelectedItem?: TypeAheadMenuItem
  typeAheadEventPrefix: TypeAheadEventPrefix
  style?: React.CSSProperties
  typeAheadPlaceHolder: string
  typeAheadMenuOptions: TypeAheadMenuItem[]
  onSelectOption: (item: TypeAheadMenuItem) => void
  testID: string
}

type State = {
  searchTerm: string
  queryResults: TypeAheadMenuItem[]
  selectedItem: TypeAheadMenuItem
}

export class GlobalHeaderTypeAheadMenu extends React.Component<Props, State> {
  private listItemHeight = 50
  private maxDropdownHeight = 150
  constructor(props: Props) {
    super(props)
    this.state = {
      searchTerm: '',
      queryResults: this.props.typeAheadMenuOptions,
      selectedItem: this.props.defaultSelectedItem,
    }
  }

  private selectAllTextInInput = (e?: ChangeEvent<HTMLInputElement>) => {
    if (e) {
      e.target.select()
    }
  }

  private applyFilter = (filterStr: string) => {
    const {typeAheadMenuOptions} = this.props
    if (!filterStr) {
      this.setState({
        queryResults: typeAheadMenuOptions,
        searchTerm: '',
      })
    } else {
      const result = typeAheadMenuOptions.filter(val => {
        const name = val?.name || ''
        return name.toLowerCase().includes(filterStr.toLowerCase())
      })

      this.setState({
        queryResults: result,
        searchTerm: filterStr,
      })
    }
  }

  private handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const filterString = e?.target?.value
    this.applyFilter(filterString)
  }

  private clearFilter = () => {
    this.applyFilter('')
  }

  private getDisplayName = (item: TypeAheadMenuItem | null): string => {
    if (item && item.id) {
      return item.name
    }
    return ''
  }

  private handleTypeAheadItemOnClick = (item: TypeAheadMenuItem | null) => {
    const {onSelectOption} = this.props
    const itemDisplayName = this.getDisplayName(item)
    this.setState({
      selectedItem: item,
      searchTerm: itemDisplayName,
    })
    if (onSelectOption) {
      onSelectOption(item)
    }
  }

  private sendSearchEvent = e => {
    const {typeAheadEventPrefix} = this.props

    if (e.target.value.trim().length) {
      multiOrgEvent(`${typeAheadEventPrefix}.searched`, {
        searchTerm: e.target.value,
      })
    }
  }

  private calculateDropdownHeight = (numberOfItems: number) =>
    Math.min(numberOfItems * this.listItemHeight, this.maxDropdownHeight)

  render() {
    const {typeAheadPlaceHolder = 'Type here to search', style} = this.props
    const {searchTerm, queryResults, selectedItem} = this.state

    const filterSearchInput = (
      <Input
        placeholder={typeAheadPlaceHolder}
        onChange={this.handleInputChange}
        value={searchTerm}
        testID={this.props.testID}
        onClear={this.clearFilter}
        onFocus={this.selectAllTextInInput}
        onBlur={this.sendSearchEvent}
        className="global-header--typeahead-input"
      />
    )

    return (
      <div>
        {filterSearchInput}
        {queryResults && queryResults.length > 0 ? (
          <List
            height={
              style?.height ?? this.calculateDropdownHeight(queryResults.length)
            }
            itemCount={queryResults.length}
            itemSize={this.listItemHeight}
            width="100%"
            layout="vertical"
            itemData={queryResults}
            className="global-header--list"
          >
            {({data, index, style}) => {
              const value = data[index]
              // add the 'active' class to highlight when arrowing; like a hover
              const classN = classnames('global-header--typeahead-item', {
                active: value.id === selectedItem.id,
              })

              return (
                <div key={value.id} style={style}>
                  <Dropdown.Item
                    id={value.id.toString()}
                    value={value}
                    onClick={() => this.handleTypeAheadItemOnClick(value)}
                    /* Values need to be compared as string because account items have number ids*/
                    selected={
                      value.id.toString() === selectedItem?.id.toString()
                    }
                    className={classN}
                    trailingIconOnSelected={true}
                  >
                    {value.name}
                  </Dropdown.Item>
                  {index !== queryResults.length - 1 && (
                    <hr className="cf-dropdown-menu__line-break" />
                  )}
                </div>
              )
            }}
          </List>
        ) : (
          <Dropdown.Item key="empty-filter" disabled={true}>
            {searchTerm.length > 0
              ? `no matches for ${searchTerm}`
              : 'No results'}
          </Dropdown.Item>
        )}
      </div>
    )
  }
}
