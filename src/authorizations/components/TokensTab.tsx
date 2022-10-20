// Libraries
import React, {createRef, PureComponent, RefObject} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import {isEmpty} from 'lodash'
import {AutoSizer} from 'react-virtualized'

// Components
import {
  ComponentColor,
  ComponentSize,
  ConfirmationButton,
  EmptyState,
  IconFont,
  InputToggleType,
  Sort,
  Toggle,
} from '@influxdata/clockface'
import {SearchWidget} from 'src/shared/components/search_widget/SearchWidget'
import TokenList from 'src/authorizations/components/TokenList'
import {FilterListContainer} from 'src/shared/components/FilterList'
import TabbedPageHeader from 'src/shared/components/tabbed_page/TabbedPageHeader'
import GenerateTokenDropdown from 'src/authorizations/components/GenerateTokenDropdown'
import ResourceSortDropdown from 'src/shared/components/resource_sort_dropdown/ResourceSortDropdown'

// Types
import {AppState, Authorization, ResourceType} from 'src/types'
import {SortTypes} from 'src/shared/utils/sort'
import {AuthorizationSortKey} from 'src/shared/components/resource_sort_dropdown/generateSortItems'

// Selectors
import {getAll} from 'src/resources/selectors'
import {bulkDeleteAuthorizations} from 'src/authorizations/actions/thunks'

// Styles
import './TokensTabStyles.scss'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {event} from 'src/cloud/utils/reporting'

// Constants
import {CLOUD} from 'src/shared/constants'
import {GLOBAL_HEADER_HEIGHT} from 'src/identity/components/GlobalHeader/constants'

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

  allTokens: Authorization[]
  tokensOnCurrentPage: Authorization[]
  tokensSelectedForBatchOperation: Authorization[]
}

interface StateProps {
  tokens: Authorization[]
}

interface DispatchProps {
  bulkDeleteAuthorizations: (tokenIds: string[]) => void
}

const DEFAULT_PAGINATION_CONTROL_HEIGHT = 62
const DEFAULT_TAB_NAVIGATION_HEIGHT = 85

type SortKey = keyof Authorization

type ReduxProps = ConnectedProps<typeof connector>
type Props = StateProps & RouteComponentProps<{orgID: string}> & ReduxProps

const FilterAuthorizations = FilterListContainer<Authorization>()

class TokensTab extends PureComponent<Props, State> {
  private paginationRef: RefObject<HTMLDivElement>

  constructor(props) {
    super(props)
    this.state = {
      searchTerm: '',
      sortKey: 'description',
      sortDirection: Sort.Ascending,
      sortType: SortTypes.String,

      allTokens: [],
      tokensOnCurrentPage: [],
      tokensSelectedForBatchOperation: [],
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
    const {
      searchTerm,
      sortKey,
      sortDirection,
      sortType,
      tokensSelectedForBatchOperation,
    } = this.state
    const {tokens} = this.props

    const leftHeaderItems = (
      <>
        {isFlagEnabled('bulkActionDeleteTokens') && (
          <Toggle
            type={InputToggleType.Checkbox}
            checked={tokensSelectedForBatchOperation.length > 0}
            id="batch-select-global-toggle"
            className="batch-select-global-toggle"
            size={ComponentSize.Small}
            icon={this.getGlobalBatchSelectionToggleIcon()}
            onChange={this.toggleGlobalBatchSelection}
          />
        )}

        {isFlagEnabled('bulkActionDeleteTokens') &&
          tokensSelectedForBatchOperation.length > 0 && (
            <ConfirmationButton
              confirmationButtonText="Delete"
              confirmationLabel={`Are you sure you want to delete the ${tokensSelectedForBatchOperation.length} selected API Token(s)?`}
              onConfirm={this.handleBulkDeleteTokens}
              text={`Delete ${tokensSelectedForBatchOperation.length} selected`}
              icon={IconFont.Trash_New}
              color={ComponentColor.Secondary}
            />
          )}
        {tokensSelectedForBatchOperation.length === 0 && (
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
        )}
      </>
    )

    const rightHeaderItems = <GenerateTokenDropdown />

    return (
      <AutoSizer>
        {({width, height}) => {
          const heightWithPagination =
            this.paginationRef?.current?.clientHeight +
              DEFAULT_TAB_NAVIGATION_HEIGHT ||
            DEFAULT_PAGINATION_CONTROL_HEIGHT + DEFAULT_TAB_NAVIGATION_HEIGHT

          const adjustedHeight =
            height - heightWithPagination - (CLOUD ? GLOBAL_HEADER_HEIGHT : 0)

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
                  {filteredAuths =>
                    isFlagEnabled('bulkActionDeleteTokens') ? (
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
                        setAllTokens={allTokens =>
                          this.setState({allTokens: allTokens})
                        }
                        setTokensOnCurrentPage={tokensOnPage =>
                          this.setState({tokensOnCurrentPage: tokensOnPage})
                        }
                        tokensSelectedForBatchOperation={
                          tokensSelectedForBatchOperation
                        }
                        toggleTokenSelection={this.updateSelectedTokensList}
                      />
                    ) : (
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
                    )
                  }
                </FilterAuthorizations>
              </div>
            </>
          )
        }}
      </AutoSizer>
    )
  }

  private updateSelectedTokensList = (token: Authorization) => {
    const {tokensSelectedForBatchOperation} = this.state
    const tokenAlreadySelected = tokensSelectedForBatchOperation.includes(token)

    if (tokenAlreadySelected) {
      const updatedTokensList = tokensSelectedForBatchOperation.filter(
        tokenA => tokenA !== token
      )
      this.setState({
        tokensSelectedForBatchOperation: updatedTokensList,
      })
    } else {
      this.setState({
        tokensSelectedForBatchOperation: [
          ...tokensSelectedForBatchOperation,
          token,
        ],
      })
    }
  }
  private handleBulkDeleteTokens = () => {
    this.props.bulkDeleteAuthorizations(
      this.state.tokensSelectedForBatchOperation.map(token => token.id)
    )

    const numberOfSelectedTokens =
      this.state.tokensSelectedForBatchOperation.length
    event('bulkAction.tokens.deleted', {}, {count: numberOfSelectedTokens})
    // reset the list of selected tokens
    this.setState({
      tokensSelectedForBatchOperation: [],
    })
  }

  private getGlobalBatchSelectionToggleIcon = () => {
    const {tokensOnCurrentPage, tokensSelectedForBatchOperation} = this.state

    if (tokensSelectedForBatchOperation.length < tokensOnCurrentPage.length) {
      return IconFont.Subtract
    }
    if (tokensSelectedForBatchOperation.length === tokensOnCurrentPage.length) {
      return IconFont.CheckMark_New
    }

    return IconFont.Subtract
  }

  private toggleGlobalBatchSelection = () => {
    const {tokensOnCurrentPage, tokensSelectedForBatchOperation} = this.state

    if (isEmpty(tokensSelectedForBatchOperation)) {
      this.setState({tokensSelectedForBatchOperation: tokensOnCurrentPage})
      event(
        'bulkAction.tokens.selectAll',
        {},
        {count: tokensOnCurrentPage.length}
      )
    } else {
      event('bulkAction.tokens.deSelectAll')
      this.setState({tokensSelectedForBatchOperation: []})
    }
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

const mdtp = {
  bulkDeleteAuthorizations,
}
const connector = connect(mstp, mdtp)

export default connect<StateProps, DispatchProps>(
  mstp,
  mdtp
)(withRouter(TokensTab))
