import React, {ChangeEvent} from 'react'
import {Dropdown, Input} from '@influxdata/clockface'
import {FixedSizeList as List} from 'react-window'
import classnames from 'classnames'
import {TypeAheadMenuItem} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown'

type Props = {
  defaultSelectedItem?: TypeAheadMenuItem
  style?: React.CSSProperties
  typeAheadPlaceHolder: string
  typeAheadMenuOptions: TypeAheadMenuItem[]
  onSelectOption: (item: TypeAheadMenuItem) => void
}

type State = {
  searchTerm: string
  queryResults: TypeAheadMenuItem[]
  selectedItem: TypeAheadMenuItem
}

export class GlobalHeaderTypeAheadMenu extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      searchTerm: '',
      queryResults: this.props.typeAheadMenuOptions,
      selectedItem: this.props.defaultSelectedItem,
    }
  }

  private selectAllTextInInput = (event?: ChangeEvent<HTMLInputElement>) => {
    if (event) {
      event.target.select()
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

  private handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const filterString = event?.target?.value
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

  render() {
    const {typeAheadPlaceHolder = 'Type here to search', style} = this.props
    const {searchTerm, queryResults, selectedItem} = this.state

    const filterSearchInput = (
      <Input
        placeholder={typeAheadPlaceHolder}
        onChange={this.handleInputChange}
        value={searchTerm}
        testID="dropdown-input-typeAhead"
        onClear={this.clearFilter}
        onFocus={this.selectAllTextInInput}
        className="global-header--typeahead-input"
      />
    )

    return (
      <div>
        {filterSearchInput}
        {queryResults && queryResults.length > 0 ? (
          <List
            height={style?.height ?? 150}
            itemCount={queryResults.length}
            itemSize={50}
            width="100%"
            layout="vertical"
            itemData={queryResults}
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

export default GlobalHeaderTypeAheadMenu
