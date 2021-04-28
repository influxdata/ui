// Libraries
import React, {PureComponent} from 'react'
import {debounce} from 'lodash'

// Components
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'

// Types
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

    return (
      <div className="flux-toolbar--search">
        <SearchWidget
          placeholderText={`Filter ${this.props.resourceName}...`}
          onSearch={this.handleChange}
          searchTerm={searchTerm}
          testID="flux-toolbar-search--input"
        />
      </div>
    )
  }

  private handleSearch = (): void => {
    this.props.onSearch(this.state.searchTerm)
  }

  private handleChange = (searchTerm: string): void => {
    this.setState({searchTerm}, this.handleSearch)
  }
}

export default FluxToolbarSearch
