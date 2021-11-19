// Libraries
import React, {PureComponent, RefObject} from 'react'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import memoizeOne from 'memoize-one'

// Components
import BucketCard from 'src/buckets/components/BucketCard'
import {ResourceList} from '@influxdata/clockface'

// Selectors
import {getSortedResources} from 'src/shared/utils/sort'

// Types
import {Bucket, OwnBucket, Pageable} from 'src/types'
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

class BucketList
  extends PureComponent<Props & RouteComponentProps<{orgID: string}>>
  implements Pageable {
  private memGetSortedResources = memoizeOne<typeof getSortedResources>(
    getSortedResources
  )

  public currentPage: number = 1
  public rowsPerPage: number = 10
  public totalPages: number

  public componentDidMount() {
    const params = new URLSearchParams(window.location.search)
    const urlPageNumber = parseInt(params.get('page'), 10)

    const passedInPageIsValid =
      urlPageNumber && urlPageNumber <= this.totalPages && urlPageNumber > 0

    if (passedInPageIsValid) {
      this.currentPage = urlPageNumber
    }
  }

  public componentDidUpdate() {
    // if the user filters the list while on a page that is
    // outside the new filtered list put them on the last page of the new list
    if (this.currentPage > this.totalPages) {
      this.paginate(this.totalPages)
    }
  }

  public render() {
    this.totalPages = Math.max(
      Math.ceil(this.props.buckets.length / this.rowsPerPage),
      1
    )

    return (
      <>
        <ResourceList>
          <ResourceList.Body
            emptyState={this.props.emptyState}
            style={{
              maxHeight: this.props.pageHeight,
              minHeight: this.props.pageHeight,
              overflow: 'auto',
            }}
          >
            {this.listBuckets}
          </ResourceList.Body>
        </ResourceList>
        <PaginationNav.PaginationNav
          ref={this.props.paginationRef}
          style={{width: this.props.pageWidth}}
          totalPages={this.totalPages}
          currentPage={this.currentPage}
          pageRangeOffset={1}
          onChange={this.paginate}
        />
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

  private get listBuckets(): JSX.Element[] {
    const {
      onDeleteBucket,
      onFilterChange,
      onUpdateBucket,
      onGetBucketSchema,
    } = this.props

    const sortedBuckets = this.memGetSortedResources(
      this.props.buckets,
      this.props.sortKey,
      this.props.sortDirection,
      this.props.sortType
    )

    const startIndex = this.rowsPerPage * Math.max(this.currentPage - 1, 0)
    const endIndex = Math.min(
      startIndex + this.rowsPerPage,
      this.props.bucketCount
    )

    const userBuckets = []
    const systemBuckets = []
    sortedBuckets.forEach(bucket => {
      if(bucket.type === 'user') {
        userBuckets.push(bucket)
      }else {
        systemBuckets.push(bucket)
      }
    })
    const userAndSystemBuckets = [...userBuckets, ...systemBuckets]

    const buckets = []
    for (let i = startIndex; i < endIndex; i++) {
      const bucket = userAndSystemBuckets[i]
      if (bucket) {
        buckets.push(
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

    return buckets
  }
}

export default withRouter(BucketList)
