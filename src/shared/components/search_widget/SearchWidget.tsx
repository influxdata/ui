// Libraries
import React, {Component, ChangeEvent} from 'react'
import {debounce} from 'lodash'

// Components
import {ComponentSize, ComponentStatus, Input} from '@influxdata/clockface'

// Types
import {IconFont} from '@influxdata/clockface'

// Decorators
import {ErrorHandling} from 'src/shared/decorators/errors'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

interface Props {
  onSearch: (searchTerm: string) => void
  placeholderText: string
  searchTerm: string
  testID: string
  tabIndex?: number
  autoFocus?: boolean
  status?: ComponentStatus
  size?: ComponentSize
}

interface State {
  searchTerm: string
}

@ErrorHandling
export class SearchWidget extends Component<Props, State> {
  public static defaultProps = {
    widthPixels: 440,
    placeholderText: 'Search...',
    searchTerm: '',
    testID: 'search-widget',
    autoFocus: false,
    tabIndex: 0,
    size: ComponentSize.Small,
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.props.searchTerm !== prevProps.searchTerm) {
      this.setState({searchTerm: this.props.searchTerm})
    }
  }

  constructor(props: Props) {
    super(props)
    this.state = {
      searchTerm: this.props.searchTerm,
    }
  }

  public UNSAFE_componentWillMount() {
    this.handleSearch = debounce(this.handleSearch, 50)
  }

  public render() {
    const {
      placeholderText,
      status = ComponentStatus.Default,
      testID,
      tabIndex = 0,
      autoFocus,
      size,
    } = this.props
    const {searchTerm} = this.state

    return (
      <ErrorBoundary>
        <Input
          icon={IconFont.Search_New}
          placeholder={placeholderText}
          value={searchTerm}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          testID={testID}
          className="search-widget-input "
          tabIndex={tabIndex}
          onClear={this.clear}
          autoFocus={autoFocus}
          size={size}
          status={status}
        />
      </ErrorBoundary>
    )
  }

  private handleSearch = (): void => {
    this.props.onSearch(this.state.searchTerm)
  }

  private handleBlur = (e: ChangeEvent<HTMLInputElement>): void => {
    this.setState({searchTerm: e.target.value}, this.handleSearch)
  }

  private handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    this.setState({searchTerm: e.target.value}, this.handleSearch)
  }
  private clear = (): void => {
    this.setState({searchTerm: ''}, this.handleSearch)
  }
}
