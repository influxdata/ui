// Libraries
import React, {
  PureComponent,
  RefObject,
  FC,
  useState,
  useEffect,
  useMemo,
  useReducer,
} from 'react'
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

type SortKey = keyof Authorization

interface Props {
  auths: Authorization[]
  emptyState: JSX.Element
  pageHeight: number
  pageWidth: number
  searchTerm: string // why not used?
  sortKey: string
  sortDirection: Sort
  sortType: SortTypes
  tokenCount: number
  onClickColumn: (nextSort: Sort, sortKey: SortKey) => void // why not used?
}

interface State {
  isTokenOverlayVisible: boolean
  authInView: Authorization
}

class TokenList_T extends PureComponent<Props, State> {
  private memGetSortedResources = memoizeOne<typeof getSortedResources>(
    getSortedResources
  )

  private paginationRef: RefObject<HTMLDivElement>
  public currentPage: number = 1
  public rowsPerPage: number = 10
  public totalPages: number

  constructor(props) {
    super(props)
    this.state = {
      isTokenOverlayVisible: false,
      authInView: null,
    }
  }

  public componentDidMount() {
    const params = new URLSearchParams(window.location.search)
    const urlPageNumber = parseInt(params.get('page'), 10)

    const passedInPageIsValid =
      urlPageNumber && urlPageNumber <= this.totalPages && urlPageNumber > 0

    if (passedInPageIsValid) {
      this.currentPage = urlPageNumber
    }
  }

  public componentDidUpdate(prevProps) {
    // if the user filters the list while on a page that is
    // outside the new filtered list put them on the last page of the new list
    if (this.currentPage > this.totalPages) {
      this.paginate(this.totalPages)
    }

    const {auths: prevAuths} = prevProps
    const {auths: nextAuths} = this.props

    if (!isEqual(prevAuths, nextAuths)) {
      const authInView = nextAuths.find(
        auth => auth.id === this.state.authInView?.id
      )
      this.setState({authInView})
    }
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
          currentPage={this.currentPage}
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
    this.currentPage = page
    const url = new URL(location.href)
    url.searchParams.set('page', page)
    history.replaceState(null, '', url.toString())
    this.forceUpdate()
  }

  private get rows(): JSX.Element[] {
    const {auths, sortDirection, sortKey, sortType} = this.props
    const sortedAuths = this.memGetSortedResources(
      auths,
      sortKey,
      sortDirection,
      sortType
    )

    const startIndex = this.rowsPerPage * Math.max(this.currentPage - 1, 0)
    const endIndex = Math.min(
      startIndex + this.rowsPerPage,
      this.props.tokenCount
    )

    const paginatedAuths = []
    for (let i = startIndex; i < endIndex; i++) {
      const auth = sortedAuths[i]

      if (auth) {
        paginatedAuths.push(
          <TokenRow
            key={auth.id}
            auth={auth}
            onClickDescription={this.handleClickDescription}
          />
        )
      }
    }

    return paginatedAuths
  }

  private handleDismissOverlay = () => {
    this.setState({isTokenOverlayVisible: false})
  }

  private handleClickDescription = (authID: string): void => {
    const authInView = this.props.auths.find(a => a.id === authID)
    this.setState({isTokenOverlayVisible: true, authInView})
  }
}

const TokenList: FC<Props> = ({
  auths,
  emptyState,
  pageHeight,
  pageWidth,
  sortKey,
  sortDirection,
  sortType,
  tokenCount,
}) => {
  const [isTokenOverlayVisible, setIsTokenOverlayVisible] = useState(false)
  const [authInView, setAuthInView] = useState(null)
  const [, forceUpdate] = useReducer(x => x + 1, 0)

  let paginationRef: RefObject<HTMLDivElement>
  let currentPage: number = 1
  const rowsPerPage: number = 10
  const totalPages: number = Math.max(Math.ceil(auths.length / rowsPerPage), 1)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlPageNumber = parseInt(params.get('page'), 10)

    const passedInPageIsValid =
      urlPageNumber && urlPageNumber <= totalPages && urlPageNumber > 0

    if (passedInPageIsValid) {
      currentPage = urlPageNumber
    }
  }, [])

  useEffect(() => {
    // TODO
    // if the user filters the list while on a page that is
    // outside the new filtered list put them on the last page of the new list
    if (currentPage > totalPages) {
      paginate(totalPages)
    }
  })

  useEffect(() => {
    const newAuthInView = auths.find(auth => auth.id === authInView?.id)
    setAuthInView(newAuthInView)
  }, [auths])

  const sortedAuths = useMemo(
    () => getSortedResources(auths, sortKey, sortDirection, sortType),
    [auths, sortKey, sortDirection, sortType]
  )

  const paginate = page => {
    console.log(page)
    currentPage = page
    const url = new URL(location.href)
    url.searchParams.set('page', page)
    history.replaceState(null, '', url.toString())
    forceUpdate()
  }

  const rows = (): JSX.Element[] => {
    const startIndex = rowsPerPage * Math.max(currentPage - 1, 0)
    const endIndex = Math.min(startIndex + rowsPerPage, tokenCount)

    const paginatedAuths = []
    for (let i = startIndex; i < endIndex; i++) {
      const auth = sortedAuths[i]

      if (auth) {
        paginatedAuths.push(
          <TokenRow
            key={auth.id}
            auth={auth}
            onClickDescription={handleClickDescription}
          />
        )
      }
    }

    return paginatedAuths
  }

  const handleDismissOverlay = () => {
    setIsTokenOverlayVisible(false)
  }

  const handleClickDescription = (authID: string): void => {
    const newAuthInView = auths.find(a => a.id === authID)
    setAuthInView(newAuthInView)
    setIsTokenOverlayVisible(true)
  }

  return (
    <>
      <ResourceList style={{width: pageWidth}}>
        <ResourceList.Body
          emptyState={emptyState}
          style={{
            maxHeight: pageHeight,
            minHeight: pageHeight,
            overflow: 'auto',
          }}
          testID="token-list"
        >
          {rows()}
        </ResourceList.Body>
      </ResourceList>
      <PaginationNav.PaginationNav
        ref={paginationRef}
        style={{width: pageWidth}}
        totalPages={totalPages}
        currentPage={currentPage}
        pageRangeOffset={1}
        onChange={paginate}
      />
      <Overlay visible={isTokenOverlayVisible}>
        <EditTokenOverlay
          auth={authInView}
          onDismissOverlay={handleDismissOverlay}
        />
      </Overlay>
    </>
  )
}

export default React.memo(TokenList)
// export default TokenList_T
