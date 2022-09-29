// Libraries
import React, {PureComponent, RefObject} from 'react'
import memoizeOne from 'memoize-one'
import isEqual from 'lodash/isEqual'

// Components
import {Overlay, PaginationNav, ResourceList} from '@influxdata/clockface'
import {TokenRow} from 'src/authorizations/components/TokenRow'
import EditTokenOverlay from 'src/authorizations/components/EditTokenOverlay'

// Types
import {Authorization} from 'src/types'
import {SortTypes} from 'src/shared/utils/sort'
import {Sort} from '@influxdata/clockface'

// Utils
import {getSortedResources} from 'src/shared/utils/sort'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

type SortKey = keyof Authorization

interface Props {
  auths: Authorization[]
  emptyState: JSX.Element
  pageHeight: number
  pageWidth: number
  searchTerm: string
  sortKey: string
  sortDirection: Sort
  sortType: SortTypes
  tokenCount: number
  onClickColumn: (nextSort: Sort, sortKey: SortKey) => void
  // bulk action props
  setAllTokens?: (sortedAuths: Authorization[]) => void
  setTokensOnCurrentPage?: (tokens: Authorization[]) => void
  tokensSelectedForBatchOperation?: Authorization[]
  toggleTokenSelection?: (token: Authorization) => void
}

interface State {
  isTokenOverlayVisible: boolean
  authInView: Authorization

  currentPage: number
}

export default class TokenList extends PureComponent<Props, State> {
  private memGetSortedResources =
    memoizeOne<typeof getSortedResources>(getSortedResources)

  private paginationRef: RefObject<HTMLDivElement>
  public rowsPerPage: number = 10
  public totalPages: number

  constructor(props) {
    super(props)
    this.state = {
      isTokenOverlayVisible: false,
      authInView: null,
      currentPage: 1,
    }
  }

  public componentDidMount() {
    const params = new URLSearchParams(window.location.search)
    const urlPageNumber = parseInt(params.get('page'), 10)

    const passedInPageIsValid =
      urlPageNumber && urlPageNumber <= this.totalPages && urlPageNumber > 0

    if (passedInPageIsValid) {
      this.setState({currentPage: urlPageNumber})
    }

    // send the tokens info up once when the component finishes mounting
    if (isFlagEnabled('bulkActionDeleteTokens')) {
      this.passTokensInformationToParent()
    }
  }

  public componentDidUpdate(prevProps, prevState) {
    // if the user filters the list while on a page that is
    // outside the new filtered list put them on the last page of the new list
    if (this.state.currentPage > this.totalPages) {
      this.paginate(this.totalPages)
    }

    const {auths: prevAuths} = prevProps
    const {auths: nextAuths} = this.props

    if (!isEqual(prevAuths, nextAuths)) {
      const authInView = nextAuths.find(
        auth => auth.id === this.state.authInView?.id
      )
      this.setState({authInView})

      // send the tokens info up when new tokens are passed as props (e.g: search filter was used by the user)
      if (isFlagEnabled('bulkActionDeleteTokens')) {
        this.passTokensInformationToParent()
      }
    }

    const {currentPage: prevPage} = prevState
    const {currentPage: nextPage} = this.state

    if (!isEqual(prevPage, nextPage)) {
      // send the tokens info up when a new page is selected from the pagination
      if (isFlagEnabled('bulkActionDeleteTokens')) {
        this.passTokensInformationToParent()
      }
    }
  }

  private passTokensInformationToParent() {
    const {auths, sortDirection, sortKey, sortType} = this.props
    const sortedAuths = this.memGetSortedResources(
      auths,
      sortKey,
      sortDirection,
      sortType
    )

    // send sorted tokens to parent
    this.props.setAllTokens(sortedAuths)

    // send tokens on the current page
    const startIndex =
      this.rowsPerPage * Math.max(this.state.currentPage - 1, 0)
    const endIndex = Math.min(
      startIndex + this.rowsPerPage,
      this.props.tokenCount
    )

    this.props.setTokensOnCurrentPage(sortedAuths.slice(startIndex, endIndex))
  }

  public render() {
    const {isTokenOverlayVisible, authInView} = this.state
    this.totalPages = Math.max(
      Math.ceil(this.props.auths.length / this.rowsPerPage),
      1
    )

    return (
      <>
        <ResourceList style={{width: this.props.pageWidth}}>
          <ResourceList.Body
            emptyState={this.props.emptyState}
            style={{
              maxHeight: this.props.pageHeight,
              minHeight: this.props.pageHeight,
              overflow: 'auto',
            }}
            testID="token-list"
          >
            {this.rows}
          </ResourceList.Body>
        </ResourceList>
        <PaginationNav.PaginationNav
          ref={this.paginationRef}
          style={{width: this.props.pageWidth}}
          totalPages={this.totalPages}
          currentPage={this.state.currentPage}
          pageRangeOffset={1}
          onChange={this.paginate}
        />
        <Overlay visible={isTokenOverlayVisible}>
          <EditTokenOverlay
            auth={authInView}
            onDismissOverlay={this.handleDismissOverlay}
          />
        </Overlay>
      </>
    )
  }

  public paginate = page => {
    this.setState({currentPage: page})
    const url = new URL(location.href)
    url.searchParams.set('page', page)
    history.replaceState(null, '', url.toString())
    this.forceUpdate()
  }

  private get rows(): JSX.Element[] {
    const {
      auths,
      sortDirection,
      sortKey,
      sortType,
      tokensSelectedForBatchOperation,
    } = this.props
    const sortedAuths = this.memGetSortedResources(
      auths,
      sortKey,
      sortDirection,
      sortType
    )

    const startIndex =
      this.rowsPerPage * Math.max(this.state.currentPage - 1, 0)
    const endIndex = Math.min(
      startIndex + this.rowsPerPage,
      this.props.tokenCount
    )

    const paginatedAuths = []
    for (let i = startIndex; i < endIndex; i++) {
      const auth = sortedAuths[i]

      if (auth) {
        paginatedAuths.push(
          isFlagEnabled('bulkActionDeleteTokens') ? (
            <TokenRow
              key={auth.id}
              auth={auth}
              onClickDescription={this.handleClickDescription}
              tokenIsSelected={tokensSelectedForBatchOperation.includes(auth)}
              onSelectForBulkAction={this.handleTokenCardCheckboxClick}
            />
          ) : (
            <TokenRow
              key={auth.id}
              auth={auth}
              onClickDescription={this.handleClickDescription}
            />
          )
        )
      }
    }

    return paginatedAuths
  }

  // adds or removes the token from the tokensSelectedForBatchOperation list based on whether the token already exists in the list
  private handleTokenCardCheckboxClick = (token: Authorization) => {
    this.props.toggleTokenSelection(token)
  }

  private handleDismissOverlay = () => {
    this.setState({isTokenOverlayVisible: false})
  }

  private handleClickDescription = (authID: string): void => {
    const authInView = this.props.auths.find(a => a.id === authID)
    this.setState({isTokenOverlayVisible: true, authInView})
  }
}
