// Libraries
import React, {createRef, PureComponent, RefObject} from 'react'
import {connect} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import {isEmpty} from 'lodash'
import {AutoSizer} from 'react-virtualized'

// Components
import {
  Sort,
  ComponentSize,
  EmptyState,
  BannerPanel,
  Gradients,
  IconFont,
  InfluxColors,
} from '@influxdata/clockface'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import TokenList from 'src/authorizations/components/TokenList'
import FilterList from 'src/shared/components/FilterList'
import TabbedPageHeader from 'src/shared/components/tabbed_page/TabbedPageHeader'
import GenerateTokenDropdown from 'src/authorizations/components/GenerateTokenDropdown'
import ResourceSortDropdown from 'src/shared/components/resource_sort_dropdown/ResourceSortDropdown'
import PostDeploymentTokensBanner from 'src/authorizations/components/PostDeploymentTokensBanner'

// Types
import {AppState, Authorization, ResourceType} from 'src/types'
import {SortTypes} from 'src/shared/utils/sort'
import {AuthorizationSortKey} from 'src/shared/components/resource_sort_dropdown/generateSortItems'

// Selectors
import {getAll} from 'src/resources/selectors'

enum AuthSearchKeys {
  Description = 'description',
  Status = 'status',
  CreatedAt = 'createdAt',
}

interface State {
  searchTerm: string
  sortKey: SortKey
  sortDirection: Sort
  sortType: SortTypes
}

interface StateProps {
  tokens: Authorization[]
}

const DEFAULT_PAGINATION_CONTROL_HEIGHT = 62
const DEFAULT_TAB_NAVIGATION_HEIGHT = 62
const DEFAULT_ALERT_HEIGHT = 100

type SortKey = keyof Authorization

type Props = StateProps & RouteComponentProps<{orgID: string}>

const FilterAuthorizations = FilterList<Authorization>()

class TokensTab extends PureComponent<Props, State> {
  private paginationRef: RefObject<HTMLDivElement>

  constructor(props) {
    super(props)
    this.state = {
      searchTerm: '',
      sortKey: 'description',
      sortDirection: Sort.Ascending,
      sortType: SortTypes.String,
    }
    this.paginationRef = createRef<HTMLDivElement>()
  }

  public componentDidMount() {
    const params = new URLSearchParams(window.location.search)

    let sortType: SortTypes = this.state.sortType
    let sortKey: AuthorizationSortKey = 'description'
    if (params.get('sortKey') === 'status') {
      sortKey = 'status'
      sortType = SortTypes.String
    } else if (params.get('sortKey') === 'createdAt') {
      sortKey = 'createdAt'
      sortType = SortTypes.String
    }

    let sortDirection: Sort = this.state.sortDirection
    if (params.get('sortDirection') === Sort.Ascending) {
      sortDirection = Sort.Ascending
    } else if (params.get('sortDirection') === Sort.Descending) {
      sortDirection = Sort.Descending
    }

    let searchTerm: string = ''
    if (params.get('searchTerm') !== null) {
      searchTerm = params.get('searchTerm')
    }

    this.setState({sortKey, sortDirection, sortType, searchTerm})
  }

  public render() {
    const {searchTerm, sortKey, sortDirection, sortType} = this.state
    const {tokens} = this.props

    const leftHeaderItems = (
      <>
        <SearchWidget
          searchTerm={searchTerm}
          placeholderText="Filter Tokens..."
          onSearch={this.handleFilterUpdate}
          testID="input-field--filter"
        />
        <ResourceSortDropdown
          resourceType={ResourceType.Authorizations}
          sortDirection={sortDirection}
          sortKey={sortKey}
          sortType={sortType}
          onSelect={this.handleSort}
          width={238}
        />
      </>
    )

    const rightHeaderItems = <GenerateTokenDropdown />

    const tokensBanner = () => {
      return (
        <>
          <BannerPanel
            size={ComponentSize.ExtraSmall}
            gradient={Gradients.PolarExpress}
            icon={IconFont.Bell}
            hideMobileIcon={true}
            textColor={InfluxColors.Yeti}
          >
            <PostDeploymentTokensBanner />
          </BannerPanel>
        </>
      )
    }

    return (
      <>
        {tokensBanner()}
        <AutoSizer>
          {({width, height}) => {
            const heightWithPagination =
              this.paginationRef?.current?.clientHeight +
                DEFAULT_TAB_NAVIGATION_HEIGHT ||
              DEFAULT_PAGINATION_CONTROL_HEIGHT +
                DEFAULT_TAB_NAVIGATION_HEIGHT +
                DEFAULT_ALERT_HEIGHT

            const adjustedHeight = height - heightWithPagination
            return (
              <>
                <div style={{margin: '10px 0px'}}>
                  <TabbedPageHeader
                    childrenLeft={leftHeaderItems}
                    childrenRight={rightHeaderItems}
                    width={width}
                  />
                  <FilterAuthorizations
                    list={tokens}
                    searchTerm={searchTerm}
                    searchKeys={this.searchKeys}
                  >
                    {filteredAuths => (
                      <TokenList
                        tokenCount={tokens.length}
                        auths={filteredAuths}
                        emptyState={this.emptyState}
                        pageWidth={width}
                        pageHeight={adjustedHeight}
                        searchTerm={searchTerm}
                        sortKey={sortKey}
                        sortDirection={sortDirection}
                        sortType={sortType}
                        onClickColumn={this.handleClickColumn}
                      />
                    )}
                  </FilterAuthorizations>
                </div>
              </>
            )
          }}
        </AutoSizer>
      </>
    )
  }

  private handleSort = (
    sortKey: SortKey,
    sortDirection: Sort,
    sortType: SortTypes
  ): void => {
    const url = new URL(location.href)
    url.searchParams.set('sortKey', sortKey)
    url.searchParams.set('sortDirection', sortDirection)
    history.replaceState(null, '', url.toString())

    this.setState({sortKey, sortDirection, sortType})
  }

  private handleClickColumn = (nextSort: Sort, sortKey: SortKey) => {
    const sortType = SortTypes.String
    this.setState({sortKey, sortDirection: nextSort, sortType})
  }

  private handleFilterUpdate = (searchTerm: string): void => {
    const url = new URL(location.href)
    url.searchParams.set('searchTerm', searchTerm)
    history.replaceState(null, '', url.toString())
    this.setState({searchTerm})
  }

  private get searchKeys(): AuthSearchKeys[] {
    return [
      AuthSearchKeys.Status,
      AuthSearchKeys.Description,
      AuthSearchKeys.CreatedAt,
    ]
  }

  private get emptyState(): JSX.Element {
    const {searchTerm} = this.state

    if (isEmpty(searchTerm)) {
      return (
        <EmptyState size={ComponentSize.Large}>
          <EmptyState.Text>
            Looks like there aren't any <b>API Tokens</b>, why not generate one?
          </EmptyState.Text>
          <GenerateTokenDropdown />
        </EmptyState>
      )
    }

    return (
      <EmptyState size={ComponentSize.Large}>
        <EmptyState.Text>No API Tokens match your query</EmptyState.Text>
      </EmptyState>
    )
  }
}

const mstp = (state: AppState) => ({
  tokens: getAll<Authorization>(state, ResourceType.Authorizations),
})

export default connect<StateProps>(mstp)(withRouter(TokensTab))
