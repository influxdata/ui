// Libraries
import React, {PureComponent, ChangeEvent} from 'react'
import {debounce} from 'lodash'

// Components
import {Input} from '@influxdata/clockface'

// Types
import {InputType, IconFont} from '@influxdata/clockface'

interface Props {
  onSearch: (s: string) => void
  resourceName: string
}

interface State {
  searchTerm: string
}

const DEBOUNCE_MS = 100

class FluxToolbarSearch extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      searchTerm: '',
    }

    this.handleSearch = debounce(this.handleSearch, DEBOUNCE_MS)
  }

  public render() {
    const {searchTerm} = this.state

    // not using the searchwidget, as this uses a debounced search
    // just adding the onClear.  if others use a debounced search, then will enhance the searchwidget
    return (
      <div className="flux-toolbar--search">
        <Input
          type={InputType.Text}
          icon={IconFont.Search_New}
          placeholder={`Filter ${this.props.resourceName}...`}
          onChange={this.handleChange}
          value={searchTerm}
          testID="flux-toolbar-search--input"
          onClear={this.onClear}
        />
      </div>
    )
  }

  private handleSearch = (): void => {
    this.props.onSearch(this.state.searchTerm)
  }

  private handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    this.setState({searchTerm: e.target.value}, this.handleSearch)
  }

  private onClear = (): void => {
    this.setState({searchTerm: ''}, this.handleSearch)
  }
}

export default FluxToolbarSearch
