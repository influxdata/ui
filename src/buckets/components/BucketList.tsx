// Libraries
import React, {
  FC,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

// Components
import BucketCard from 'src/buckets/components/BucketCard'
import {ResourceList} from '@influxdata/clockface'

// Selectors
import {getSortedResources} from 'src/shared/utils/sort'

// Types
import {Bucket, OwnBucket} from 'src/types'
import {PaginationNav, Sort} from '@influxdata/clockface'

// Utils
import {SortTypes} from 'src/shared/utils/sort'

interface Props {
  buckets: Bucket[]
  bucketCount: number
  emptyState: JSX.Element
  onUpdateBucket: (b: OwnBucket) => void
  onDeleteBucket: (b: OwnBucket) => void
  onGetBucketSchema: (b: OwnBucket) => void
  onFilterChange: (searchTerm: string) => void
  pageHeight: number
  pageWidth: number
  paginationRef: RefObject<HTMLDivElement>
  sortKey: string
  sortDirection: Sort
  sortType: SortTypes
}

const BucketList: FC<Props> = ({
  buckets,
  bucketCount,
  emptyState,
  onUpdateBucket,
  onDeleteBucket,
  onGetBucketSchema,
  onFilterChange,
  pageHeight,
  pageWidth,
  paginationRef,
  sortKey,
  sortDirection,
  sortType,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const rowsPerPage: number = 10
  const totalPages: number = Math.max(
    Math.ceil(buckets.length / rowsPerPage),
    1
  )

  const paginate = useCallback((page: number) => {
    const url = new URL(location.href)
    url.searchParams.set('page', page.toString())
    history.replaceState(null, '', url.toString())
    setCurrentPage(page)
  }, [])

  useEffect(() => {
    // serve as componentDidMount()
    const params = new URLSearchParams(window.location.search)
    const urlPageNumber = parseInt(params.get('page'), 10)

    const passedInPageIsValid =
      urlPageNumber && urlPageNumber <= totalPages && urlPageNumber > 0

    if (passedInPageIsValid) {
      setCurrentPage(urlPageNumber)
    }
  }, [])

  useEffect(() => {
    // serve as componentDidUpdate()

    // if the user filters the list while on a page that is
    // outside the new filtered list put them on the last page of the new list
    if (currentPage > totalPages) {
      paginate(totalPages)
    }
  }, [currentPage, totalPages, paginate])

  const sortedBuckets = useMemo(
    () => getSortedResources(buckets, sortKey, sortDirection, sortType),
    [buckets, sortKey, sortDirection, sortType]
  )

  const listBuckets = (): JSX.Element[] => {
    const startIndex = rowsPerPage * Math.max(currentPage - 1, 0)
    const endIndex = Math.min(startIndex + rowsPerPage, bucketCount)

    const userBuckets = []
    const systemBuckets = []
    sortedBuckets.forEach(bucket => {
      if (bucket.type === 'user') {
        userBuckets.push(bucket)
      } else {
        systemBuckets.push(bucket)
      }
    })
    const userAndSystemBuckets = [...userBuckets, ...systemBuckets]

    const _buckets = [] as JSX.Element[]
    for (let i = startIndex; i < endIndex; i++) {
      const bucket = userAndSystemBuckets[i]
      if (bucket) {
        _buckets.push(
          <BucketCard
            key={bucket.id}
            bucket={bucket}
            onDeleteBucket={onDeleteBucket}
            onUpdateBucket={onUpdateBucket}
            onFilterChange={onFilterChange}
            onGetBucketSchema={onGetBucketSchema}
          />
        )
      }
    }

    return _buckets
  }

  return (
    <>
      <ResourceList>
        <ResourceList.Body
          emptyState={emptyState}
          style={{
            maxHeight: pageHeight,
            minHeight: pageHeight,
            overflow: 'auto',
          }}
        >
          {listBuckets()}
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
    </>
  )
}

export default React.memo(BucketList)
