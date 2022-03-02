// Libraries
import React, {
  RefObject,
  FC,
  useState,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react'

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
  searchTerm: string
  sortKey: string
  sortDirection: Sort
  sortType: SortTypes
  tokenCount: number
  onClickColumn: (nextSort: Sort, sortKey: SortKey) => void
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
  const currentPage = useRef<number>(1)
  const rowsPerPage: number = 10
  const totalPages: number = Math.max(Math.ceil(auths.length / rowsPerPage), 1)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlPageNumber = parseInt(params.get('page'), 10)

    const passedInPageIsValid =
      urlPageNumber && urlPageNumber <= totalPages && urlPageNumber > 0

    if (passedInPageIsValid) {
      currentPage.current = urlPageNumber
    }
  }, [])

  useEffect(() => {
    // if the user filters the list while on a page that is
    // outside the new filtered list put them on the last page of the new list
    if (currentPage.current > totalPages) {
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
    currentPage.current = page
    const url = new URL(location.href)
    url.searchParams.set('page', page)
    history.replaceState(null, '', url.toString())
    forceUpdate()
  }

  const rows = (): JSX.Element[] => {
    const startIndex = rowsPerPage * Math.max(currentPage.current - 1, 0)
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
        currentPage={currentPage.current}
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
